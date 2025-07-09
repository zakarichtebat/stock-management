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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { SearchProductDto } from './dto/search-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';

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
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/products',
        filename: (req, file, callback) => {
          try {
            // Vérifier si le fichier existe
            if (!file) {
              callback(new BadRequestException({
                message: 'Aucun fichier n\'a été fourni',
                statusCode: 400
              }), '');
              return;
            }

            // Vérifier le type MIME
            const mimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!mimeTypes.includes(file.mimetype)) {
              callback(new BadRequestException({
                message: 'Format de fichier non valide. Utilisez JPG, PNG ou GIF.',
                statusCode: 400
              }), '');
              return;
            }

            // Générer un nom de fichier unique
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = extname(file.originalname).toLowerCase();
            callback(null, `${uniqueSuffix}${ext}`);
          } catch (error) {
            callback(new BadRequestException({
              message: 'Erreur lors du traitement du fichier',
              statusCode: 400
            }), '');
          }
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
      },
      fileFilter: (req, file, callback) => {
        try {
          const ext = extname(file.originalname).toLowerCase();
          if (!ext.match(/\.(jpg|jpeg|png|gif)$/)) {
            return callback(new BadRequestException({
              message: 'Seuls les fichiers JPG, PNG et GIF sont autorisés.',
              statusCode: 400
            }), false);
          }
          callback(null, true);
        } catch (error) {
          callback(new BadRequestException({
            message: 'Erreur lors de la validation du fichier',
            statusCode: 400
          }), false);
        }
      },
    }),
  )
  async create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      createProductDto.imageUrl = `products/${file.filename}`;
    }
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
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/products',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return callback(new BadRequestException('Seuls les fichiers image sont autorisés!'), false);
        }
        callback(null, true);
      },
    }),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      updateProductDto.imageUrl = `products/${file.filename}`;
    }
    return this.productService.update(id, updateProductDto);
  }

  @Post(':id/image')
  @ApiOperation({ summary: 'Télécharger une image pour un produit' })
  @ApiResponse({ status: 200, description: 'Image téléchargée avec succès' })
  @ApiResponse({ status: 400, description: 'Format de fichier non valide' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/products',
        filename: (req, file, callback) => {
          try {
            // Vérifier si le fichier existe
            if (!file) {
              callback(new BadRequestException({
                message: 'Aucun fichier n\'a été fourni',
                statusCode: 400
              }), '');
              return;
            }

            // Vérifier le type MIME
            const mimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!mimeTypes.includes(file.mimetype)) {
              callback(new BadRequestException({
                message: 'Format de fichier non valide. Utilisez JPG, PNG ou GIF.',
                statusCode: 400
              }), '');
              return;
            }

            // Générer un nom de fichier unique
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = extname(file.originalname).toLowerCase();
            callback(null, `${uniqueSuffix}${ext}`);
          } catch (error) {
            callback(new BadRequestException({
              message: 'Erreur lors du traitement du fichier',
              statusCode: 400
            }), '');
          }
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
      },
      fileFilter: (req, file, callback) => {
        try {
          const ext = extname(file.originalname).toLowerCase();
          if (!ext.match(/\.(jpg|jpeg|png|gif)$/)) {
            return callback(new BadRequestException({
              message: 'Seuls les fichiers JPG, PNG et GIF sont autorisés.',
              statusCode: 400
            }), false);
          }
          callback(null, true);
        } catch (error) {
          callback(new BadRequestException({
            message: 'Erreur lors de la validation du fichier',
            statusCode: 400
          }), false);
        }
      },
    }),
  )
  async uploadImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      if (!file) {
        throw new BadRequestException({
          message: 'Aucun fichier n\'a été téléchargé',
          statusCode: 400
        });
      }

      const imageUrl = `products/${file.filename}`;
      const product = await this.productService.update(id, { imageUrl });

      return {
        statusCode: 200,
        message: 'Image téléchargée avec succès',
        path: imageUrl,
        product
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Erreur lors du téléchargement de l\'image. Veuillez réessayer.',
        statusCode: 400
      });
    }
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
