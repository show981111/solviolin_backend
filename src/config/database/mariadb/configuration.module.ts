import * as Joi from '@hapi/joi';
import { Module } from '@nestjs/common';
import configuration from './configuration';
import { MariaDBConfigService } from './configuration.service';
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
        host: Joi.string(),
        port: Joi.number().default(3306),
        username: Joi.string(),
        password: Joi.string(),
        database: Joi.string().default('solviolin_dev'),
      }),
    }),
  ],
  providers: [ConfigService, MariaDBConfigService],
  exports: [ConfigService, MariaDBConfigService],
})
export class MariaDBConfigModule {}