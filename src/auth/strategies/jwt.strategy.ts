import { BadRequestException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtConfigService } from 'src/config/jwt/configuration.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(JwtConfigService: JwtConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: JwtConfigService.access_key,
        });
    }

    async validate(payload: any) {
        return {
            userID: payload.userID,
            userPhone: payload.userPhone,
        };
    }
}
