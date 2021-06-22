import * as Joi from '@hapi/joi';
import { Module } from '@nestjs/common';
import configuration from './configuration';
import { JwtConfigService } from './configuration.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
/**
 * Import and provide app configuration related classes.
 *
 * @module
 */
@Module({
    imports: [
        ConfigModule.forRoot({
            load: [configuration],
            validationSchema: Joi.object({
                access_key: Joi.string(),
                access_expiration: Joi.string(),
                refresh_key: Joi.string(),
                refresh_expiration: Joi.string(),
            }),
        }),
    ],
    providers: [ConfigService, JwtConfigService],
    exports: [ConfigService, JwtConfigService],
})
export class JwtConfigModule {}
