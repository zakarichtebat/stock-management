import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import * as PDFDocument from 'pdfkit';

export const InvoiceStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  CANCELLED: 'CANCELLED',
  OVERDUE: 'OVERDUE'
} as const;

type InvoiceStatusType = typeof InvoiceStatus[keyof typeof InvoiceStatus];

@Injectable()
export class InvoiceService {
  constructor(private prisma: PrismaService) {}

  private async generateInvoiceNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    // Get the latest invoice number for this month
    const latestInvoice = await this.prisma.invoice.findFirst({
      where: {
        number: {
          startsWith: `F${year}${month}`
        }
      },
      orderBy: {
        number: 'desc'
      }
    });
    
    let sequence;
    if (latestInvoice) {
      // Extract the sequence number from the latest invoice and increment it
      const currentSequence = parseInt(latestInvoice.number.slice(-3));
      sequence = String(currentSequence + 1).padStart(3, '0');
    } else {
      // If no invoice exists for this month, start with 001
      sequence = '001';
    }
    
    // Generate number in format: F202401001 (F + YYYYMM + 3-digit sequence)
    const proposedNumber = `F${year}${month}${sequence}`;
    
    // Verify the number is unique
    const existingInvoice = await this.prisma.invoice.findUnique({
      where: { number: proposedNumber }
    });
    
    if (existingInvoice) {
      // If number exists, recursively try the next number
      return this.generateInvoiceNumber();
    }
    
    return proposedNumber;
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

  async create(createInvoiceDto: CreateInvoiceDto) {
    const { items, ...invoiceData } = createInvoiceDto;
    
    // Calculate totals
    const { subtotal, total } = this.calculateTotals(
      items,
      invoiceData.discount || 0
    );

    // Generate invoice number
    const number = await this.generateInvoiceNumber();

    // Set default due date to 30 days if not provided
    const dueDate = invoiceData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Create invoice with items
    const invoice = await this.prisma.invoice.create({
      data: {
        number,
        dueDate,
        ...invoiceData,
        subtotal,
        total,
        updatedAt: new Date(),
        invoiceitem: {
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

    return this.prisma.invoice.findUnique({
      where: { id: invoice.id },
      include: {
        invoiceitem: {
          include: {
            product: true
          }
        }
      }
    });
  }

  async findAll() {
    return this.prisma.invoice.findMany({
      include: {
        invoiceitem: {
          include: {
            product: true
          }
        },
        quote: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async findOne(id: number) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        invoiceitem: {
          include: {
            product: true
          }
        },
        quote: true
      }
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    return invoice;
  }

  async updateStatus(id: number, status: InvoiceStatusType) {
    return this.prisma.invoice.update({
      where: { id },
      data: { status }
    });
  }

  async generatePDF(id: number): Promise<Buffer> {
    const invoice = await this.findOne(id);
    const doc = new PDFDocument({ margin: 50 });
    const buffers: Buffer[] = [];

    doc.on('data', buffers.push.bind(buffers));

    // Add company logo and info
    doc.fontSize(20).text('Your Company Name', { align: 'right' });
    doc.fontSize(10).text('123 Business Street', { align: 'right' });
    doc.text('City, Country', { align: 'right' });
    doc.moveDown();

    // Add invoice details
    doc.fontSize(20).text('FACTURE', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Numéro: ${invoice.number}`);
    doc.text(`Date: ${invoice.date.toLocaleDateString()}`);
    doc.text(`Échéance: ${invoice.dueDate.toLocaleDateString()}`);
    doc.moveDown();

    // Add client info
    doc.text('Client:');
    doc.text(invoice.clientName);
    if (invoice.clientEmail) doc.text(invoice.clientEmail);
    if (invoice.clientAddress) doc.text(invoice.clientAddress);
    doc.moveDown();

    // Add items table
    const tableTop = doc.y;
    doc.font('Helvetica-Bold');
    
    // Table headers
    ['Produit', 'Quantité', 'Prix unitaire', 'Total'].forEach((text, i) => {
      doc.text(text, 50 + (i * 140), tableTop, { width: 140, align: 'left' });
    });

    // Table content
    doc.font('Helvetica');
    let y = tableTop + 20;
    invoice.invoiceitem.forEach(item => {
      doc.text(item.product.name, 50, y, { width: 140 });
      doc.text(item.quantity.toString(), 190, y, { width: 140 });
      doc.text(`${item.unitPrice.toFixed(2)} €`, 330, y, { width: 140 });
      doc.text(`${item.total.toFixed(2)} €`, 470, y, { width: 140 });
      y += 20;
    });

    // Add totals
    doc.moveDown();
    doc.text(`Sous-total: ${invoice.subtotal.toFixed(2)} €`, { align: 'right' });
    if (invoice.discount > 0) {
      doc.text(`Remise (${invoice.discount}%): ${((invoice.subtotal * invoice.discount) / 100).toFixed(2)} €`, { align: 'right' });
    }
    doc.font('Helvetica-Bold');
    doc.text(`Total: ${invoice.total.toFixed(2)} €`, { align: 'right' });

    doc.end();

    return Buffer.concat(buffers);
  }
} 