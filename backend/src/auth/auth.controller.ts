import { Body, Controller, Post, Get, Req, Res, UseGuards, UnauthorizedException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { CreateUserDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { GoogleAuthGuard } from './google-guards/google-guards.guard';

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

    @UseGuards(GoogleAuthGuard)
     @Get('google')
    async googlelogin() {
        // This route will be handled by the GoogleStrategy
    }

    @UseGuards(GoogleAuthGuard)
     @Get('google/callback')
    async googlecallback(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const response = await this.login(req.user as any, res);
        res.redirect(process.env.GOOGLE_FRONTEND_REDIRECT_URL + '?token=' + (response as any).accessToken);
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
        return this.authService.logout((req.user as any).id, res);
    }
}
