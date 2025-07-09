import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { user } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export interface LoginDto {
  email: string;
  password: string;
}

export interface JwtPayload {
  sub: number;
  email: string;
  name: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private userService: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.user.findUnique({ where: { email } });
    
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Compte désactivé');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(user: user) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
      },
    };
  }

  async register(registerDto: {
    email: string;
    password: string;
    name: string;
    role?: any;
  }) {
    const user = await this.userService.user.create({
      data: {
        email: registerDto.email,
        password: await bcrypt.hash(registerDto.password, 10),
        name: registerDto.name,
        role: registerDto.role || 'USER',
        updatedAt: new Date()
      },
    });
    const { password, ...userWithoutPassword } = user;
    
    return {
      message: 'Utilisateur créé avec succès',
      user: userWithoutPassword,
    };
  }

  async validateToken(payload: JwtPayload) {
    const user = await this.userService.user.findUnique({ where: { id: payload.sub } });
    
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Token invalide ou utilisateur désactivé');
    }

    return user;
  }
} 