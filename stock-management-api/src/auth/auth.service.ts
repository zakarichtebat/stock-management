import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';

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
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Compte désactivé');
    }

    const isPasswordValid = await this.userService.validatePassword(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(user: User) {
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
    const user = await this.userService.create(registerDto);
    const { password, ...userWithoutPassword } = user;
    
    return {
      message: 'Utilisateur créé avec succès',
      user: userWithoutPassword,
    };
  }

  async validateToken(payload: JwtPayload) {
    const user = await this.userService.findOne(payload.sub);
    
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Token invalide ou utilisateur désactivé');
    }

    return user;
  }
} 