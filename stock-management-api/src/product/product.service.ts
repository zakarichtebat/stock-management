import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { product } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { SearchProductDto } from './dto/search-product.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto): Promise<product> {
    // Vérifier si le code-barres existe déjà
    if (createProductDto.barcode) {
      const existingProduct = await this.prisma.product.findUnique({
        where: { barcode: createProductDto.barcode },
      });
      if (existingProduct) {
        throw new ConflictException('Un produit avec ce code-barres existe déjà');
      }
    }

    // Préparer les données avec conversion des dates
    const data = {
      ...createProductDto,
      entryDate: createProductDto.entryDate ? new Date(createProductDto.entryDate) : new Date(),
      expirationDate: createProductDto.expirationDate ? new Date(createProductDto.expirationDate) : null,
      updatedAt: new Date()
    };

    return this.prisma.product.create({ data });
  }

  async findAll(): Promise<product[]> {
    return this.prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number): Promise<product> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Produit avec l'ID ${id} non trouvé`);
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<product> {
    // Vérifier si le produit existe
    await this.findOne(id);

    // Vérifier le code-barres si fourni
    if (updateProductDto.barcode) {
      const existingProduct = await this.prisma.product.findUnique({
        where: { barcode: updateProductDto.barcode },
      });
      if (existingProduct && existingProduct.id !== id) {
        throw new ConflictException('Un autre produit avec ce code-barres existe déjà');
      }
    }

    // Préparer les données avec conversion des dates
    const data = {
      ...updateProductDto,
      entryDate: updateProductDto.entryDate ? new Date(updateProductDto.entryDate) : undefined,
      expirationDate: updateProductDto.expirationDate ? new Date(updateProductDto.expirationDate) : undefined,
      updatedAt: new Date()
    };

    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  async remove(id: number): Promise<product> {
    // Vérifier si le produit existe
    await this.findOne(id);

    return this.prisma.product.delete({
      where: { id },
    });
  }

  async search(searchDto: SearchProductDto): Promise<product[]> {
    const where: any = {};

    // Filtres de base
    if (searchDto.name) {
      where.name = { contains: searchDto.name };
    }

    if (searchDto.category) {
      where.category = { contains: searchDto.category };
    }

    if (searchDto.supplier) {
      where.supplier = { contains: searchDto.supplier };
    }

    if (searchDto.barcode) {
      where.barcode = searchDto.barcode;
    }

    if (searchDto.isActive !== undefined) {
      where.isActive = searchDto.isActive;
    }

    // Filtres de prix
    if (searchDto.minPrice !== undefined || searchDto.maxPrice !== undefined) {
      where.salePrice = {};
      if (searchDto.minPrice !== undefined) {
        where.salePrice.gte = searchDto.minPrice;
      }
      if (searchDto.maxPrice !== undefined) {
        where.salePrice.lte = searchDto.maxPrice;
      }
    }

    // Filtre stock faible
    if (searchDto.lowStock) {
      where.quantity = { lte: 5 }; // Stock faible <= 5
    }

    // Filtre expiration proche
    if (searchDto.expiringInDays !== undefined) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + searchDto.expiringInDays);
      where.expirationDate = {
        lte: futureDate,
        gte: new Date(),
      };
    }

    return this.prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findLowStockProducts(): Promise<product[]> {
    return this.prisma.product.findMany({
      where: {
        isActive: true,
        quantity: { lte: 5 }, // Stock <= au minimum défini
      },
      orderBy: { quantity: 'asc' },
    });
  }

  async findExpiringProducts(days: number = 30): Promise<product[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.prisma.product.findMany({
      where: {
        isActive: true,
        expirationDate: {
          lte: futureDate,
          gte: new Date(),
        },
      },
      orderBy: { expirationDate: 'asc' },
    });
  }

  async findExpiredProducts(): Promise<product[]> {
    return this.prisma.product.findMany({
      where: {
        isActive: true,
        expirationDate: {
          lt: new Date(),
        },
      },
      orderBy: { expirationDate: 'asc' },
    });
  }

  async updateStock(id: number, quantity: number): Promise<product> {
    await this.findOne(id);

    return this.prisma.product.update({
      where: { id },
      data: { quantity },
    });
  }

  async adjustStock(id: number, adjustment: number): Promise<product> {
    const product = await this.findOne(id);
    const newQuantity = Math.max(0, product.quantity + adjustment);

    return this.prisma.product.update({
      where: { id },
      data: { quantity: newQuantity },
    });
  }

  async getProductStats(): Promise<{
    total: number;
    active: number;
    lowStock: number;
    expiring: number;
    expired: number;
  }> {
    const [total, active, lowStock, expiring, expired] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.product.count({
        where: {
          isActive: true,
          quantity: { lte: 5 },
        },
      }),
      this.prisma.product.count({
        where: {
          isActive: true,
          expirationDate: {
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
            gte: new Date(),
          },
        },
      }),
      this.prisma.product.count({
        where: {
          isActive: true,
          expirationDate: {
            lt: new Date(),
          },
        },
      }),
    ]);

    return { total, active, lowStock, expiring, expired };
  }
}
