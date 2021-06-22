import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
/**
 * Service dealing with app config based operations.
 *
 * @class
 */
@Injectable()
export class JwtConfigService {
    constructor(private configService: ConfigService) {}

    public get access_key(): string {
        return this.configService.get<string>('jwt.access_key');
    }
    public get access_expiration(): string {
        return this.configService.get<string>('jwt.access_expiration');
    }
    get refresh_key(): string {
        return this.configService.get<string>('jwt.refresh_key');
    }
    get refresh_expiration(): string {
        return this.configService.get<string>('jwt.refresh_expiration');
    }
}
