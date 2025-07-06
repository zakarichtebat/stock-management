import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsDateString, IsBoolean, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ description: 'Nom du produit', example: 'Iphone 15' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Quantité en stock', example: 50, minimum: 0 })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiPropertyOptional({ description: 'Date d\'entrée en stock', example: '2025-01-15' })
  @IsOptional()
  @IsDateString()
  entryDate?: string;

  @ApiPropertyOptional({ description: 'Date d\'expiration', example: '2025-12-31' })
  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @ApiProperty({ description: 'Prix d\'achat', example: 800.50, minimum: 0 })
  @IsNumber()
  @Min(0)
  purchasePrice: number;

  @ApiProperty({ description: 'Prix de vente', example: 1200.00, minimum: 0 })
  @IsNumber()
  @Min(0)
  salePrice: number;

  @ApiPropertyOptional({ description: 'Description du produit', example: 'Smartphone dernière génération' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Catégorie du produit', example: 'Électronique' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Fournisseur', example: 'Apple Inc.' })
  @IsOptional()
  @IsString()
  supplier?: string;

  @ApiPropertyOptional({ description: 'Code-barres', example: '1234567890123' })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiPropertyOptional({ description: 'Stock minimum', example: 5, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minStock?: number;

  @ApiPropertyOptional({ description: 'Produit actif', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
} 