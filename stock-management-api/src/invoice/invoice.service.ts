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

    // Set blue color for borders
    const blueColor = '#000080';
    doc.lineWidth(1);

    // Draw main outer rectangle with rounded corners
    doc.roundedRect(40, 40, 520, 700, 10).strokeColor(blueColor).stroke();

    // Draw header section
    doc.strokeColor(blueColor);
    doc.fontSize(12);
    
    // Draw "Le" box on the left
    doc.roundedRect(50, 50, 100, 30, 5).stroke();
    
    // Draw "Facture N°" box
    doc.roundedRect(300, 50, 250, 25, 5).stroke();
    doc.text('Facture N°', 310, 58);
    doc.text(invoice.number.slice(-2), 420, 58);

    // Draw "M:" line
    doc.roundedRect(300, 80, 250, 25, 5).stroke();
    doc.text('M:', 310, 88);
    if (invoice.clientName) {
      doc.text(invoice.clientName, 330, 88);
    }

    // Draw table starting at y=120
    const tableTop = 120;
    const tableLeft = 50;
    const tableWidth = 500;
    const tableHeight = 550; // Reduced height to make room for total

    // Draw table outer border
    doc.roundedRect(tableLeft, tableTop, tableWidth, tableHeight, 5).stroke();

    // Draw table headers
    doc.text('Quantité', 60, tableTop + 10);
    doc.text('Désignation', 150, tableTop + 10);
    doc.text('P. Unit.', 380, tableTop + 10);
    doc.text('P. Total', 460, tableTop + 10);

    // Draw vertical lines for columns
    doc.moveTo(130, tableTop).lineTo(130, tableTop + tableHeight).stroke();
    doc.moveTo(370, tableTop).lineTo(370, tableTop + tableHeight).stroke();
    doc.moveTo(450, tableTop).lineTo(450, tableTop + tableHeight).stroke();

    // Draw horizontal line under headers
    doc.moveTo(tableLeft, tableTop + 30).lineTo(tableLeft + tableWidth, tableTop + 30).stroke();

    // Draw dotted lines for rows
    const rowHeight = 25;
    const numberOfRows = Math.floor((tableHeight - 40) / rowHeight);
    doc.dash(2, { space: 2 });

    for (let i = 1; i <= numberOfRows; i++) {
      const y = tableTop + 30 + (i * rowHeight);
      doc.moveTo(tableLeft, y).lineTo(tableLeft + tableWidth, y).stroke();
    }

    // Reset dash
    doc.undash();

    // Add items if any
    let y = tableTop + 40;
    if (invoice.invoiceitem) {
      invoice.invoiceitem.forEach(item => {
        doc.text(item.quantity.toString(), 60, y);
        doc.text(item.product.name, 140, y);
        doc.text(item.unitPrice.toFixed(2), 380, y);
        doc.text(item.total.toFixed(2), 460, y);
        y += rowHeight;
      });
    }

    // Add total section at the bottom
    const totalBoxY = tableTop + tableHeight + 20;
    doc.roundedRect(300, totalBoxY, 250, 30, 5).stroke();
    doc.text('Total:', 310, totalBoxY + 10);
    doc.text(invoice.total.toFixed(2), 460, totalBoxY + 10);

    doc.end();
    return Buffer.concat(buffers);
  }
} 