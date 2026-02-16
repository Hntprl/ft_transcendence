import { Body, Controller, Post, Get, Req, Res, UseGuards, UnauthorizedException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { CreateUserDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {

    constructor( private readonly authService:AuthService) {}

    @Post('register')
    register(@Body() dto: CreateUserDto)
    {
        return this.authService.registerUser(dto);
    }

    @Post('login')
    login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response)
    {
        return this.authService.loginUser(dto, res);
    }

    @Post('refresh')
    refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response)
    {
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken) throw new UnauthorizedException('Missing refresh token');
        return this.authService.refresh(refreshToken, res);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    me(@Req() req: Request)
    {
        return req.user;
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    logout(@Req() req: Request, @Res({ passthrough: true }) res: Response)
    {
        return this.authService.logout(req.user!.id, res);
    }
}
