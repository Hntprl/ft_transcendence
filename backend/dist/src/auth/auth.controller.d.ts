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
    googlelogin(): Promise<void>;
    googlecallback(req: Request, res: Response): Promise<void>;
    me(req: Request): Express.User | undefined;
    logout(req: Request, res: Response): Promise<{
        ok: boolean;
    }>;
}
