import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtConfigService } from 'src/config/jwt/configuration.service';
import { User } from 'src/entities/user.entity';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UserService,
        private readonly jwtService: JwtService,
        private readonly jwtConfigSerivce: JwtConfigService,
    ) {}

    async validateUser(userID: string, userPassword: string): Promise<any> {
        const user = await this.usersService.getUserByID(userID);
        const hashedPassword = await bcrypt.hash(String(userPassword), user.salt);
        if (user && user.userPassword === hashedPassword && user.status === 1) {
            const { userPassword, salt, ...result } = user;
            return result;
        }
        return null;
    }

    async getUserProfile(userID: string): Promise<any> {
        const user = await this.usersService.getUserByID(userID);
        const { userPassword, salt, refreshToken, ...result } = user;
        return result;
    }

    issueAccessToken(payload: object, sub: string): string {
        return this.jwtService.sign(payload, {
            secret: this.jwtConfigSerivce.access_key,
            expiresIn: `${this.jwtConfigSerivce.access_expiration}`,
            subject: sub,
        });
    }

    async issueAccessTokenFromRefresh(userID: string, refreshToken: string): Promise<any> {
        const user = await this.usersService.getUserByID(userID);
        var sub = 'user';
        if (user?.userType === 2) sub = 'admin';
        if (user?.refreshToken === refreshToken) {
            const payload = { userID: user.userID, userPhone: user.userPhone };
            return { access_token: this.issueAccessToken(payload, sub) };
        } else {
            throw new UnauthorizedException('refreshToken is not matched');
        }
    }

    updateRefreshToken(userID: string, refreshToken: string) {
        return this.usersService.updateRefreshToken(userID, refreshToken);
    }

    async login(user: any) {
        //issue new refreshToken and accessToken. then update refreshToken in Database
        const payload = {
            userID: user.userID,
            userPhone: user.userPhone,
        };
        var sub = 'user';
        if (user.userType === 2) sub = 'admin';
        const { refreshToken, ...result } = user;
        const newRefreshToken = this.jwtService.sign(payload, {
            secret: this.jwtConfigSerivce.refresh_key,
            expiresIn: `${this.jwtConfigSerivce.refresh_expiration}`,
            subject: sub,
        });
        const updateRes = await this.updateRefreshToken(user.userID, newRefreshToken);
        return {
            ...result,
            access_token: this.issueAccessToken(payload, sub),
            refresh_token: newRefreshToken,
        };
    }
}
