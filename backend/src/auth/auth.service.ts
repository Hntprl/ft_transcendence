
import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	UnauthorizedException
	} from '@nestjs/common';
import {JwtService } from '@nestjs/jwt';
import type { Response } from 'express'
import { ConfigService } from '@nestjs/config'
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {

	constructor(private readonly prisma: PrismaService,
		private readonly jwt : JwtService,
		private readonly cfg: ConfigService) {}

	// register user

	hashPassword(password: string): Promise<string>
	{
			if (!password)
			{
				return Promise.resolve('GOOGLE_AUTH');
			}
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


	async refresh(refreshToken: string, res: Response)
	{
		let payload: { sub: number };
		try {
			payload = await this.jwt.verifyAsync(refreshToken, {
			secret: this.cfg.get<string>('JWT_REFRESH_SECRET'),
			});
		}
		catch
		{
			throw new UnauthorizedException('Invalid refresh token');
  		}

		const user = await this.prisma.user.findUnique(
		{
			where: { id: payload.sub },
			select: { id: true, refreshTokenHash: true },
		});
  		if (!user?.refreshTokenHash) throw new UnauthorizedException('Invalid refresh token');

  		const ok = await argon2.verify(user.refreshTokenHash, refreshToken);
  		if (!ok) throw new UnauthorizedException('Invalid refresh token');

  		return this.createTokens(user.id , res); // better: fetch email or remove email from createTokens type
	}


	private getRefreshMaxAgeMs(): number
	{
		const val = this.cfg.get<string>('JWT_REFRESH_EXPIRES') || '7d';

		if (val.endsWith('d')) {
			return parseInt(val) * 24 * 60 * 60 * 1000;
		}
		if (val.endsWith('h')) {
			return parseInt(val) * 60 * 60 * 1000;
		}
		if (val.endsWith('m')) {
			return parseInt(val) * 60 * 1000;
		}

		return 7 * 24 * 60 * 60 * 1000;
	}


async createTokens(id: number , res: Response)
{
  	const accessToken = await this.jwt.signAsync(
		{ sub: id },
		{
			secret: this.cfg.get<string>('JWT_ACCESS_SECRET'),
			expiresIn: this.cfg.get<string>('JWT_ACCESS_EXPIRES') || '15m',
		} as any,
  	);

  	const refreshToken = await this.jwt.signAsync(
		{ sub: id },
		{
	  		secret: this.cfg.get<string>('JWT_REFRESH_SECRET'),
	  		expiresIn: this.cfg.get<string>('JWT_REFRESH_EXPIRES') || '7d',
		} as any,
  	);

	res.cookie('refreshToken', refreshToken,
	{
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		path: '/auth/refresh',
		maxAge: this.getRefreshMaxAgeMs(),
	});

	const hashedToken = await argon2.hash(refreshToken);

	await this.prisma.user.update(
	{
		where: { id },
		data: { refreshTokenHash: hashedToken },
	});

	return {accessToken};
}


	async loginUser(dto: LoginDto, res: Response) 
	{
		const user  = await this.prisma.user.findUnique({
			where: { email: dto.email},
			select: {passwordHash:true, id:true}
		});
		if (!user)
		{
			throw new UnauthorizedException('Invalid credentials');
		}
		const storedPassword:string = user.passwordHash;
		let ismatch:boolean;
		if (dto.password){
			ismatch =  await argon2.verify(storedPassword, dto.password);
		}else{
			ismatch = true;
		}
		if (ismatch)
		{
			return await this.createTokens(user.id, res);
		}
		else
			throw new UnauthorizedException('Invalid credentials');
	}
	// logout user

	async logout(id: number, res: Response)
	{
		await this.prisma.user.update(
		{
			where: { id },
			data: { refreshTokenHash: null },
		});
		res.clearCookie('refreshToken', { path: '/auth/refresh' });
		return { ok: true };
	}
	
	async validateUserByGoogle(googleUser: any)
	{
		const user = await this.prisma.user.findUnique({
		where: { email: googleUser.emails[0].value },
		select: { id: true, email: true, firstName: true, lastName: true },
		});

		if (user) return user;

		const newUserData: Prisma.UserCreateInput = {
		email: googleUser.emails[0].value,
		firstName: googleUser.name?.givenName || '',
		lastName: googleUser.name?.familyName || '',
		passwordHash: 'GOOGLE_AUTH',
		};
		return this.saveNewUser(newUserData);
  }
}

 


