import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import * as crypto from 'crypto';

// Mock google-auth-library
jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({
    verifyIdToken: jest.fn(),
  })),
}));

describe('AuthService - Google Login', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwt: JwtService;
  let config: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('mock-token'),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, string> = {
                GOOGLE_CLIENT_ID: 'test-client-id',
                JWT_ACCESS_SECRET: 'test-access-secret',
                JWT_REFRESH_SECRET: 'test-refresh-secret',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwt = module.get<JwtService>(JwtService);
    config = module.get<ConfigService>(ConfigService);
  });

  describe('googleLogin', () => {
    const mockResponse: any = {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    };

    it('should throw if token is missing', async () => {
      await expect(service.googleLogin('', mockResponse)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw if client id is not configured', async () => {
      jest.spyOn(config, 'get').mockReturnValueOnce(undefined);
      await expect(
        service.googleLogin('valid-token', mockResponse),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should log in existing user with valid token', async () => {
      const { OAuth2Client } = require('google-auth-library');
      const mockTicket = {
        getPayload: jest.fn().mockReturnValue({
          email: 'test@example.com',
          given_name: 'Test',
          family_name: 'User',
          picture: 'https://example.com/pic.jpg',
        }),
      };

      OAuth2Client.mockImplementationOnce(() => ({
        verifyIdToken: jest.fn().mockResolvedValueOnce(mockTicket),
      }));

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce({
        id: 1,
        email: 'test@example.com',
        passwordHash: 'hash',
        refreshTokenHash: null,
        firstName: 'Test',
        lastName: 'User',
        avatarUrl: 'https://example.com/pic.jpg',
        bio: null,
        jobTitle: null,
        emailVerifiedAt: new Date(),
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      jest.spyOn(prisma.user, 'update').mockResolvedValueOnce({} as any);

      const result = await service.googleLogin('valid-token', mockResponse);

      expect(result).toHaveProperty('accessToken');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(prisma.user.update).toHaveBeenCalled();
      expect(mockResponse.cookie).toHaveBeenCalled();
    });

    it('should create new user with valid token if not exists', async () => {
      const { OAuth2Client } = require('google-auth-library');
      const mockTicket = {
        getPayload: jest.fn().mockReturnValue({
          email: 'newuser@example.com',
          given_name: 'New',
          family_name: 'User',
          picture: 'https://example.com/newpic.jpg',
        }),
      };

      OAuth2Client.mockImplementationOnce(() => ({
        verifyIdToken: jest.fn().mockResolvedValueOnce(mockTicket),
      }));

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(null);
      jest.spyOn(prisma.user, 'create').mockResolvedValueOnce({
        id: 2,
        email: 'newuser@example.com',
        firstName: 'New',
        lastName: 'User',
      } as any);
      jest.spyOn(prisma.user, 'update').mockResolvedValueOnce({} as any);

      const result = await service.googleLogin('valid-token', mockResponse);

      expect(result).toHaveProperty('accessToken');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'newuser@example.com' },
      });
      expect(prisma.user.create).toHaveBeenCalled();
      expect(mockResponse.cookie).toHaveBeenCalled();
    });

    it('should throw if token verification fails', async () => {
      const { OAuth2Client } = require('google-auth-library');

      OAuth2Client.mockImplementationOnce(() => ({
        verifyIdToken: jest
          .fn()
          .mockRejectedValueOnce(new Error('Invalid token')),
      }));

      await expect(
        service.googleLogin('invalid-token', mockResponse),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw if payload does not contain email', async () => {
      const { OAuth2Client } = require('google-auth-library');
      const mockTicket = {
        getPayload: jest.fn().mockReturnValue({}),
      };

      OAuth2Client.mockImplementationOnce(() => ({
        verifyIdToken: jest.fn().mockResolvedValueOnce(mockTicket),
      }));

      await expect(
        service.googleLogin('valid-token', mockResponse),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
