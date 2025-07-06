import { IsString, IsEmail, IsOptional, IsNumber, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateQuoteItemDto {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export class CreateQuoteDto {
  clientName: string;
  clientEmail?: string;
  clientAddress?: string;
  items: CreateQuoteItemDto[];
  taxRate?: number;
  discount?: number;
} 