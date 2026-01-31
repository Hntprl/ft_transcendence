
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

    async checkExistingEmail(email: string): Promise<void> {

        const user = await this.prisma.user.findUnique({
            where: {email},
            select: {id: true},
        });
        if (user) {
            throw new BadRequestException('Email already in use');
        }
    }

    async hashPassword(password: string): Promise<string>
    {
            return await argon2.hash(password);
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
}
