import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsBoolean, Min } from 'class-validator';

export class SearchProductDto {
  @ApiPropertyOptional({ description: 'Recherche par nom', example: 'iPhone' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Recherche par catégorie', example: 'Électronique' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Recherche par fournisseur', example: 'Apple' })
  @IsOptional()
  @IsString()
  supplier?: string;

  @ApiPropertyOptional({ description: 'Recherche par code-barres', example: '1234567890123' })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiPropertyOptional({ description: 'Prix minimum', example: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Prix maximum', example: 1000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ description: 'Produits actifs seulement', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Stocks faibles seulement', example: true })
  @IsOptional()
  @IsBoolean()
  lowStock?: boolean;

  @ApiPropertyOptional({ description: 'Produits proches d\'expiration (jours)', example: 30 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  expiringInDays?: number;
} 