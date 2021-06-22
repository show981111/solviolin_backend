import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MariaDBConfigService } from './config/database/mariadb/configuration.service';
import { MariaDBConfigModule } from './config/database/mariadb/configuration.module';
import { Branch } from './entities/branch.entity';
import { User } from './entities/user.entity';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [MariaDBConfigModule],
            useFactory: (MariaDBConfigService: MariaDBConfigService) => ({
                type: 'mariadb',
                database: MariaDBConfigService.database,
                host: MariaDBConfigService.host,
                port: MariaDBConfigService.port,
                username: MariaDBConfigService.username,
                password: MariaDBConfigService.password,
                entities: [Branch, User],
                // synchronize: true,
                charset: 'utf8mb4_unicode_ci',
                logging: ['query', 'error'],
            }),
            inject: [MariaDBConfigService],
        }),
        AuthModule,
        UserModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
