import type { Request, Response } from 'express';
import { CreateUserDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: CreateUserDto): Promise<{
        id: number;
        email: string;
        firstName: string;
        lastName: string;
    }>;
    login(dto: LoginDto, res: Response): Promise<{
        accessToken: string;
    }>;
    refresh(req: Request, res: Response): Promise<{
        accessToken: string;
    }>;
    me(req: Request): {
        id: number;
        email: string;
    } | undefined;
    logout(req: Request, res: Response): Promise<{
        ok: boolean;
    }>;
}
