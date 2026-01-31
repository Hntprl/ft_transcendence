import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from './dto/register.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {

    constructor( private readonly AuthService:AuthService ) {}

    @Post('register')
    register(@Body() DTO: CreateUserDto)
    {
        return this.AuthService.registerUser(DTO);
    }
}
