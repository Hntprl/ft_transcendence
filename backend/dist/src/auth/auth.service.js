"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const argon2 = __importStar(require("argon2"));
let AuthService = class AuthService {
    prisma;
    jwt;
    cfg;
    constructor(prisma, jwt, cfg) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.cfg = cfg;
    }
    hashPassword(password) {
        return argon2.hash(password);
    }
    async saveNewUser(userData) {
        try {
            return await this.prisma.user.create({
                data: userData,
                select: { id: true, email: true, firstName: true, lastName: true },
            });
        }
        catch (err) {
            if (err?.code === 'P2002') {
                throw new common_1.BadRequestException('Email already in use');
            }
            throw new common_1.InternalServerErrorException('Could not create user');
        }
    }
    async registerUser(dto) {
        const hashedPassword = await this.hashPassword(dto.password);
        const newUserData = {
            email: dto.email,
            passwordHash: hashedPassword,
            firstName: dto.firstname,
            lastName: dto.lastname,
        };
        return this.saveNewUser(newUserData);
    }
    async refresh(refreshToken, res) {
        let payload;
        try {
            payload = await this.jwt.verifyAsync(refreshToken, {
                secret: this.cfg.get('JWT_REFRESH_SECRET'),
            });
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            select: { id: true, refreshTokenHash: true },
        });
        if (!user?.refreshTokenHash)
            throw new common_1.UnauthorizedException('Invalid refresh token');
        const ok = await argon2.verify(user.refreshTokenHash, refreshToken);
        if (!ok)
            throw new common_1.UnauthorizedException('Invalid refresh token');
        return this.createTokens(user.id, res);
    }
    getRefreshMaxAgeMs() {
        const val = this.cfg.get('JWT_REFRESH_EXPIRES') || '7d';
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
    async createTokens(id, res) {
        const accessToken = await this.jwt.signAsync({ sub: id }, {
            secret: this.cfg.get('JWT_ACCESS_SECRET'),
            expiresIn: this.cfg.get('JWT_ACCESS_EXPIRES') || '15m',
        });
        const refreshToken = await this.jwt.signAsync({ sub: id }, {
            secret: this.cfg.get('JWT_REFRESH_SECRET'),
            expiresIn: this.cfg.get('JWT_REFRESH_EXPIRES') || '7d',
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/auth/refresh',
            maxAge: this.getRefreshMaxAgeMs(),
        });
        const hashedToken = await argon2.hash(refreshToken);
        await this.prisma.user.update({
            where: { id },
            data: { refreshTokenHash: hashedToken },
        });
        return { accessToken };
    }
    async loginUserById(userId, res) {
        return this.createTokens(userId, res);
    }
    async loginUser(dto, res) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
            select: { passwordHash: true, id: true, googleId: true },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.passwordHash) {
            throw new common_1.UnauthorizedException('Use Google login');
        }
        const ismatch = await argon2.verify(user.passwordHash, dto.password);
        if (!ismatch) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        return this.createTokens(user.id, res);
    }
    async logout(id, res) {
        await this.prisma.user.update({
            where: { id },
            data: { refreshTokenHash: null },
        });
        res.clearCookie('refreshToken', { path: '/auth/refresh' });
        return { ok: true };
    }
    async validateUserByGoogle(profile) {
        const email = profile.emails?.[0]?.value;
        if (!email)
            throw new Error('Google account has no email');
        const googleId = profile.id;
        let user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (user) {
            if (!user.googleId) {
                user = await this.prisma.user.update({
                    where: { id: user.id },
                    data: { googleId },
                });
            }
            return user;
        }
        return this.prisma.user.create({
            data: {
                email,
                firstName: profile.name?.givenName || '',
                lastName: profile.name?.familyName || '',
                googleId,
                passwordHash: null,
            },
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map