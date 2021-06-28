import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtConfigService } from 'src/config/jwt/configuration.service';

@Injectable()
export class JwtAdminStrategy extends PassportStrategy(Strategy, 'jwt-admin') {
    constructor(JwtConfigService: JwtConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: JwtConfigService.access_key,
        });
    }

    async validate(payload: any) {
        if (payload.sub === 'admin')
            return {
                userID: payload.userID,
                userPhone: payload.userPhone,
            };
        else throw new UnauthorizedException('not admin');
    }
}
