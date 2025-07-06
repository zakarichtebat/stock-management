import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService, LoginDto } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'Connexion utilisateur' })
  @ApiResponse({ status: 200, description: 'Connexion réussie' })
  @ApiResponse({ status: 401, description: 'Email ou mot de passe incorrect' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'admin@example.com' },
        password: { type: 'string', example: 'motdepasse123' },
      },
    },
  })
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('register')
  @ApiOperation({ summary: 'Inscription nouvel utilisateur' })
  @ApiResponse({ status: 201, description: 'Utilisateur créé avec succès' })
  @ApiResponse({ status: 409, description: 'Email déjà utilisé' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'admin@example.com' },
        password: { type: 'string', example: 'motdepasse123' },
        name: { type: 'string', example: 'John Doe' },
        role: { type: 'string', enum: ['ADMIN', 'SUPER_ADMIN'], example: 'ADMIN' },
      },
      required: ['email', 'password', 'name'],
    },
  })
  async register(@Body() registerDto: {
    email: string;
    password: string;
    name: string;
    role?: string;
  }) {
    return this.authService.register(registerDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer le profil utilisateur' })
  @ApiResponse({ status: 200, description: 'Profil utilisateur' })
  @ApiResponse({ status: 401, description: 'Token invalide' })
  async getProfile(@Request() req) {
    const { password, ...userWithoutPassword } = req.user;
    return userWithoutPassword;
  }

  @Post('validate-token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Valider le token JWT' })
  @ApiResponse({ status: 200, description: 'Token valide' })
  @ApiResponse({ status: 401, description: 'Token invalide' })
  async validateToken(@Request() req) {
    return {
      valid: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
        isActive: req.user.isActive,
      },
    };
  }
} 