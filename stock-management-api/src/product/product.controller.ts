import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { SearchProductDto } from './dto/search-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('products')
@Controller('products')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @ApiOperation({ summary: 'Ajouter un nouveau produit' })
  @ApiResponse({ status: 201, description: 'Produit créé avec succès' })
  @ApiResponse({ status: 409, description: 'Code-barres déjà utilisé' })
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les produits actifs' })
  @ApiResponse({ status: 200, description: 'Liste des produits' })
  async findAll() {
    return this.productService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Rechercher des produits avec filtres' })
  @ApiResponse({ status: 200, description: 'Résultats de la recherche' })
  async search(@Query() searchDto: SearchProductDto) {
    return this.productService.search(searchDto);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Récupérer les produits en stock faible' })
  @ApiResponse({ status: 200, description: 'Produits en stock faible' })
  async findLowStock() {
    return this.productService.findLowStockProducts();
  }

  @Get('expiring')
  @ApiOperation({ summary: 'Récupérer les produits proches d\'expiration' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Nombre de jours avant expiration (défaut: 30)' })
  @ApiResponse({ status: 200, description: 'Produits proches d\'expiration' })
  async findExpiring(@Query('days') days?: string) {
    const daysNumber = days ? parseInt(days, 10) : 30;
    if (isNaN(daysNumber) || daysNumber < 0) {
      throw new BadRequestException('Le nombre de jours doit être un nombre positif');
    }
    return this.productService.findExpiringProducts(daysNumber);
  }

  @Get('expired')
  @ApiOperation({ summary: 'Récupérer les produits expirés' })
  @ApiResponse({ status: 200, description: 'Produits expirés' })
  async findExpired() {
    return this.productService.findExpiredProducts();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Récupérer les statistiques des produits' })
  @ApiResponse({ status: 200, description: 'Statistiques des produits' })
  async getStats() {
    return this.productService.getProductStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un produit par ID' })
  @ApiResponse({ status: 200, description: 'Produit trouvé' })
  @ApiResponse({ status: 404, description: 'Produit non trouvé' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un produit' })
  @ApiResponse({ status: 200, description: 'Produit mis à jour avec succès' })
  @ApiResponse({ status: 404, description: 'Produit non trouvé' })
  @ApiResponse({ status: 409, description: 'Code-barres déjà utilisé' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un produit' })
  @ApiResponse({ status: 200, description: 'Produit supprimé avec succès' })
  @ApiResponse({ status: 404, description: 'Produit non trouvé' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.productService.remove(id);
  }

  @Patch(':id/stock')
  @ApiOperation({ summary: 'Mettre à jour le stock d\'un produit' })
  @ApiResponse({ status: 200, description: 'Stock mis à jour avec succès' })
  @ApiResponse({ status: 404, description: 'Produit non trouvé' })
  async updateStock(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { quantity: number },
  ) {
    if (body.quantity < 0) {
      throw new BadRequestException('La quantité ne peut pas être négative');
    }
    return this.productService.updateStock(id, body.quantity);
  }

  @Patch(':id/adjust-stock')
  @ApiOperation({ summary: 'Ajuster le stock d\'un produit (+ ou -)' })
  @ApiResponse({ status: 200, description: 'Stock ajusté avec succès' })
  @ApiResponse({ status: 404, description: 'Produit non trouvé' })
  async adjustStock(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { adjustment: number },
  ) {
    return this.productService.adjustStock(id, body.adjustment);
  }
}
