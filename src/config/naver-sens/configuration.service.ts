import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
/**
 * Service dealing with app config based operations.
 *
 * @class
 */
@Injectable()
export class NaverSensConfigService {
    constructor(private configService: ConfigService) {}

    public get serviceID(): string {
        return this.configService.get<string>('naver-sens.naver_sens_serviceID');
    }
    public get secretKey(): string {
        return this.configService.get<string>('naver-sens.naver_sens_API_secretKey');
    }
    public get accessKey(): string {
        return this.configService.get<string>('naver-sens.naver_sens_API_accessKey');
    }
    public get from(): string {
        return this.configService.get<string>('naver-sens.naver_sens_from');
    }
}
