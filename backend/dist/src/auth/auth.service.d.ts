import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwt;
    private readonly cfg;
    constructor(prisma: PrismaService, jwt: JwtService, cfg: ConfigService);
    hashPassword(password: string): Promise<string>;
    saveNewUser(userData: Prisma.UserCreateInput): Promise<{
        id: number;
        email: string;
        firstName: string;
        lastName: string;
    }>;
    registerUser(dto: CreateUserDto): Promise<{
        id: number;
        email: string;
        firstName: string;
        lastName: string;
    }>;
    refresh(refreshToken: string, res: Response): Promise<{
        accessToken: string;
    }>;
    private getRefreshMaxAgeMs;
    createTokens(id: number, res: Response): Promise<{
        accessToken: string;
    }>;
    loginUser(dto: LoginDto, res: Response): Promise<{
        accessToken: string;
    }>;
    logout(id: number, res: Response): Promise<{
        ok: boolean;
    }>;
}
