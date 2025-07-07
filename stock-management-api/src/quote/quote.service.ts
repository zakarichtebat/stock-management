import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { Prisma } from '@prisma/client';
import { InvoiceService } from '../invoice/invoice.service';

export const QuoteStatus = {
  DRAFT: 'DRAFT',
  SENT: 'SENT',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  CONVERTED: 'CONVERTED'
} as const;

type QuoteStatusType = typeof QuoteStatus[keyof typeof QuoteStatus];

@Injectable()
export class QuoteService {
  constructor(
    private prisma: PrismaService,
    private invoiceService: InvoiceService
  ) {}

  private async generateQuoteNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    // Get count of quotes for this month
    const count = await this.prisma.quote.count({
      where: {
        number: {
          startsWith: `Q${year}${month}`
        }
      }
    });
    
    // Generate number in format: Q202401001 (Q + YYYYMM + 3-digit sequence)
    const sequence = String(count + 1).padStart(3, '0');
    return `Q${year}${month}${sequence}`;
  }

  private calculateTotals(items: any[], discount: number = 0, taxRate: number = 20) {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const discountAmount = (subtotal * discount) / 100;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = (taxableAmount * taxRate) / 100;
    const total = taxableAmount + taxAmount;

    return {
      subtotal,
      taxAmount,
      total
    };
  }

  async create(createQuoteDto: CreateQuoteDto) {
    const { items, ...quoteData } = createQuoteDto;
    
    // Calculate totals
    const { subtotal, taxAmount, total } = this.calculateTotals(
      items,
      quoteData.discount || 0,
      quoteData.taxRate || 20
    );

    // Generate quote number
    const number = await this.generateQuoteNumber();

    // Create quote with items
    return this.prisma.quote.create({
      data: {
        number,
        date: new Date(),
        ...quoteData,
        subtotal,
        taxAmount,
        total,
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice
          }))
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });
  }

  async findAll() {
    return this.prisma.quote.findMany({
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async findOne(id: number) {
    const quote = await this.prisma.quote.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!quote) {
      throw new NotFoundException(`Quote with ID ${id} not found`);
    }

    return quote;
  }

  async updateStatus(id: number, status: QuoteStatusType) {
    return this.prisma.quote.update({
      where: { id },
      data: { status }
    });
  }

  async convertToInvoice(id: number) {
    try {
      // Use a transaction to ensure data consistency
      return await this.prisma.$transaction(async (prisma) => {
        // 1. Lock the quote for update and check if it exists
        const quote = await prisma.quote.findUnique({
          where: { id },
          include: {
            items: {
              include: {
                product: true
              }
            }
          }
        });

        if (!quote) {
          throw new NotFoundException(`Quote with ID ${id} not found`);
        }

        // 2. Check if quote is in valid state
        if (quote.status === QuoteStatus.CONVERTED) {
          throw new BadRequestException('Quote has already been converted to an invoice');
        }

        if (quote.status === QuoteStatus.REJECTED) {
          throw new BadRequestException('Cannot convert a rejected quote to an invoice');
        }

        // 3. Check for items
        if (!quote.items || quote.items.length === 0) {
          throw new BadRequestException('Cannot convert quote with no items');
        }

        // 4. Generate unique invoice number
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        
        // Get latest invoice number for this month
        const latestInvoice = await prisma.invoice.findFirst({
          where: {
            number: {
              startsWith: `F${year}${month}`
            }
          },
          orderBy: {
            number: 'desc'
          }
        });

        let sequence = '001';
        if (latestInvoice) {
          const lastSequence = parseInt(latestInvoice.number.slice(-3));
          sequence = String(lastSequence + 1).padStart(3, '0');
        }

        const invoiceNumber = `F${year}${month}${sequence}`;

        // 5. Set due date
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);

        // 6. First update quote status to prevent concurrent conversions
        await prisma.quote.update({
          where: { id },
          data: { 
            status: QuoteStatus.CONVERTED,
            updatedAt: new Date()
          }
        });

        // 7. Create invoice
        const invoice = await prisma.invoice.create({
          data: {
            number: invoiceNumber,
            date: new Date(),
            dueDate,
            clientName: quote.clientName,
            clientEmail: quote.clientEmail,
            clientAddress: quote.clientAddress,
            subtotal: quote.subtotal,
            taxRate: quote.taxRate,
            taxAmount: quote.taxAmount,
            discount: quote.discount,
            total: quote.total,
            status: 'PENDING',
            quoteId: quote.id,
            items: {
              create: quote.items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total: item.quantity * item.unitPrice
              }))
            }
          },
          include: {
            items: {
              include: {
                product: true
              }
            }
          }
        });

        return { 
          invoice,
          quote: {
            ...quote,
            status: QuoteStatus.CONVERTED
          }
        };
      }, {
        timeout: 10000, // 10 second timeout
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable // Highest isolation level
      });
    } catch (error) {
      // Handle Prisma errors
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('Duplicate invoice number or quote reference');
        }
        if (error.code === 'P2003') {
          throw new BadRequestException('Referenced product not found');
        }
      }
      
      // Re-throw application errors
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }

      // Log unexpected errors
      console.error('Error converting quote to invoice:', error);
      throw new BadRequestException('Failed to convert quote to invoice. Please try again.');
    }
  }
} 