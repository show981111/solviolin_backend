import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtConfigService } from 'src/config/jwt/configuration.service';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtRefreshStategy extends PassportStrategy(
    Strategy,
    'jwt-refresh-token',
) {
    private refreshToken: string;
    constructor(
        private readonly JwtConfigService: JwtConfigService,
        private readonly authService: AuthService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request) => {
                    this.refreshToken = request?.body?.refreshToken;
                    console.log(this.refreshToken);
                    return request?.body?.refreshToken;
                },
            ]),
            ignoreExpiration: false,
            secretOrKey: JwtConfigService.refresh_key,
        });
    }

    async validate(payload: any) {
        const issueRes = await this.authService.issueAccessTokenFromRefresh(
            payload?.userID,
            this.refreshToken,
        );
        return issueRes;
    }
}
