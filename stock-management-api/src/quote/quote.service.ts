import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
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

  private calculateTotals(items: any[], discount: number = 0) {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const discountAmount = (subtotal * discount) / 100;
    const total = subtotal - discountAmount;

    return {
      subtotal,
      total
    };
  }

  async create(createQuoteDto: CreateQuoteDto) {
    const { items, ...quoteData } = createQuoteDto;
    
    // Calculate totals
    const { subtotal, total } = this.calculateTotals(
      items,
      quoteData.discount || 0
    );

    // Generate quote number
    const number = await this.generateQuoteNumber();

    // Create quote with items
    const quote = await this.prisma.quote.create({
      data: {
        number,
        date: new Date(),
        ...quoteData,
        subtotal,
        total,
        updatedAt: new Date(),
        quoteitem: {
          createMany: {
            data: items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.quantity * item.unitPrice,
              updatedAt: new Date()
            }))
          }
        }
      }
    });

    return this.prisma.quote.findUnique({
      where: { id: quote.id },
      include: {
        quoteitem: {
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
        quoteitem: {
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
        quoteitem: {
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
      data: { 
        status,
        updatedAt: new Date()
      }
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
            quoteitem: {
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
        if (!quote.quoteitem || quote.quoteitem.length === 0) {
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

        // 6. Create invoice
        const invoice = await prisma.invoice.create({
          data: {
            number: invoiceNumber,
            date: new Date(),
            dueDate,
            clientName: quote.clientName,
            clientEmail: quote.clientEmail,
            clientAddress: quote.clientAddress,
            subtotal: quote.subtotal,
            discount: quote.discount,
            total: quote.total,
            quoteId: quote.id,
            updatedAt: new Date(),
            invoiceitem: {
              createMany: {
                data: quote.quoteitem.map(item => ({
                  productId: item.productId,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                  total: item.total,
                  updatedAt: new Date()
                }))
              }
            }
          }
        });

        // 7. Update quote status
        await prisma.quote.update({
          where: { id: quote.id },
          data: { 
            status: QuoteStatus.CONVERTED,
            updatedAt: new Date()
          }
        });

        // 8. Return created invoice
        return prisma.invoice.findUnique({
          where: { id: invoice.id },
          include: {
            invoiceitem: {
              include: {
                product: true
              }
            },
            quote: true
          }
        });
      });
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to convert quote to invoice');
    }
  }
} 