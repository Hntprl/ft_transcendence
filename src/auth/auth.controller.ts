import { Body, Controller, Post, Get, Req, UseGuards } from '@nestjs/common';
import { CreateUserDto } from './dto/register.dto';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard'

@Controller('auth')
export class AuthController {

    constructor( private readonly authService:AuthService) {}

    @Post('register')
    register(@Body() dto: CreateUserDto)
    {
        return this.authService.registerUser(dto);
    }

    @Post('login')
    login(@Body() dto: CreateUserDto)
    {
        return this.authService.loginUser(dto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    me(@Req() req: any) {
        return req.user;
  }
}
