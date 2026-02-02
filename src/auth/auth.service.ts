
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/register.dto';
import * as argon2 from 'argon2';
import {
    BadRequestException,
    Injectable,
    InternalServerErrorException
    } from '@nestjs/common';

@Injectable()
export class AuthService {

    constructor(private readonly prisma: PrismaService) {}

    // register user

    async checkExistingEmail(email: string): Promise<void> {

        const user = await this.prisma.user.findUnique({
            where: {email},
            select: {id: true},
        });
        if (user) {
            throw new BadRequestException('Email already in use');
        }
    }

    hashPassword(password: string): Promise<string>
    {
            return  argon2.hash(password);
    }

    async saveNewUser(userData: Prisma.UserCreateInput) {
        try
        {
            return await this.prisma.user.create({
            data: userData,
            select: { id: true, email: true, firstName: true, lastName: true },
            });
        }
        catch (err: any)
        {
            if (err?.code === 'P2002')
            {
                throw new BadRequestException('Email already in use');
            }
                throw new InternalServerErrorException('Could not create user');
        }
}
    async registerUser(dto: CreateUserDto)
    {
        await this.checkExistingEmail(dto.email);

        const hashedPassword =  await this.hashPassword(dto.password);

        const newUserData: Prisma.UserCreateInput = {
            email: dto.email,
            passwordHash: hashedPassword,
            firstName: dto.firstname,
            lastName: dto.lastname,
        };
        return this.saveNewUser(newUserData);
    }

    // login user
    async loginUser(dto: CreateUserDto)
    {
        const user  = await this.prisma.user.findUnique({
            where: { email: dto.email},
            select: {passwordHash:true}
        });
        if (!user)
        {
            throw new BadRequestException('Invalid email or password');
        }

        const storedPassword:string = user.passwordHash;
        const ismatch:boolean =  await argon2.verify(storedPassword, dto.password);

        if (ismatch)
            console.log("PASSWORD MATCH !!!!!!!");
        else
            throw new BadRequestException('Invalid email or password');
    }


    // logout user

}
