import * as Joi from '@hapi/joi';
import { Module } from '@nestjs/common';
import configuration from './configuration';
import { NaverSensConfigService } from './configuration.service';
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
                serviceID: Joi.string(),
                secretKey: Joi.string(),
                accessKey: Joi.string(),
                from: Joi.string(),
            }),
        }),
    ],
    providers: [ConfigService, NaverSensConfigService],
    exports: [ConfigService, NaverSensConfigService],
})
export class NaverSensConfigModule {}
