import { IsString, IsEmail, IsOptional, IsNumber, IsArray, ValidateNested, Min, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInvoiceItemDto {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export class CreateInvoiceDto {
  clientName: string;
  clientEmail?: string;
  clientAddress?: string;
  items: CreateInvoiceItemDto[];
  taxRate?: number;
  discount?: number;
  dueDate?: Date;
  quoteId?: number;
} 