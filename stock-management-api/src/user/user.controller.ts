import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { UserService, CreateUserDto } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouvel utilisateur' })
  @ApiResponse({ status: 201, description: 'Utilisateur créé avec succès' })
  @ApiResponse({ status: 409, description: 'Email déjà utilisé' })
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    // Retourner l'utilisateur sans le mot de passe
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les utilisateurs' })
  @ApiResponse({ status: 200, description: 'Liste des utilisateurs' })
  async findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un utilisateur par ID' })
  @ApiResponse({ status: 200, description: 'Utilisateur trouvé' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.findOne(id);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un utilisateur' })
  @ApiResponse({ status: 200, description: 'Utilisateur mis à jour' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: Partial<CreateUserDto>,
  ) {
    const user = await this.userService.update(id, updateUserDto);
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un utilisateur' })
  @ApiResponse({ status: 200, description: 'Utilisateur supprimé' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.remove(id);
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
} 