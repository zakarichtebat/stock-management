import { Controller, Get, Post, Body, Param, Put, Res } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InvoiceStatus } from './invoice.service';
import { Response } from 'express';

@Controller('api/invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  create(@Body() createInvoiceDto: CreateInvoiceDto) {
    return this.invoiceService.create(createInvoiceDto);
  }

  @Get()
  findAll() {
    return this.invoiceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.invoiceService.findOne(+id);
  }

  @Put(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: keyof typeof InvoiceStatus,
  ) {
    return this.invoiceService.updateStatus(+id, InvoiceStatus[status]);
  }

  @Get(':id/pdf')
  async downloadPDF(@Param('id') id: string, @Res() res: Response) {
    const buffer = await this.invoiceService.generatePDF(+id);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${id}.pdf"`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }
} 