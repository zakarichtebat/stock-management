import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuoteDto } from './dto/create-quote.dto';

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
  constructor(private prisma: PrismaService) {}

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
    const quote = await this.findOne(id);
    
    if (quote.status === QuoteStatus.CONVERTED) {
      throw new Error('Quote has already been converted to an invoice');
    }

    // Generate invoice number (similar to quote number but with 'F' prefix)
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const count = await this.prisma.invoice.count({
      where: {
        number: {
          startsWith: `F${year}${month}`
        }
      }
    });
    const sequence = String(count + 1).padStart(3, '0');
    const invoiceNumber = `F${year}${month}${sequence}`;

    // Set due date to 30 days from now
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    // Create invoice from quote
    const invoice = await this.prisma.invoice.create({
      data: {
        number: invoiceNumber,
        dueDate,
        clientName: quote.clientName,
        clientEmail: quote.clientEmail,
        clientAddress: quote.clientAddress,
        subtotal: quote.subtotal,
        taxRate: quote.taxRate,
        taxAmount: quote.taxAmount,
        discount: quote.discount,
        total: quote.total,
        quoteId: quote.id,
        items: {
          create: quote.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total
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

    // Update quote status
    await this.updateStatus(id, QuoteStatus.CONVERTED);

    return invoice;
  }
} 