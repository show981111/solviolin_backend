import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MariaDBConfigService } from './config/database/mariadb/configuration.service';
import { MariaDBConfigModule } from './config/database/mariadb/configuration.module';
import { TeacherModule } from './teacher/teacher.module';
import { ControlModule } from './control/control.module';
import { ReservationModule } from './reservation/reservation.module';
import { TermModule } from './term/term.module';
import { RegularScheduleModule } from './regular-schedule/regular-schedule.module';
import { BranchModule } from './branch/branch.module';
import { VerificationModule } from './verification/verification.module';
import { CheckInModule } from './check-in/check-in.module';
import { WinstonModule } from 'nest-winston';
import winston, { transport, transports, format } from 'winston';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HTTPLoggingInterceptor } from './utils/interceptors/HTTPlogging.interceptor';
import 'winston-daily-rotate-file';
import { AllExceptionsFilter } from './utils/filters/AllException.filter';
import { TypeOrmExceptionFilter } from './utils/filters/typeOrmException.filter';
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
                entities: [__dirname + '/entities/*.entity.{js,ts}'],
                charset: 'utf8mb4_unicode_ci',
                logging: ['query', 'error'],
                timezone: '+00:00',
            }),
            inject: [MariaDBConfigService],
        }),
        AuthModule,
        UserModule,
        TeacherModule,
        ControlModule,
        ReservationModule,
        TermModule,
        RegularScheduleModule,
        BranchModule,
        VerificationModule,
        CheckInModule,
        WinstonModule.forRoot({
            // options
            format: format.combine(
                format.colorize(),
                format.timestamp(),
                format.printf((msg) => {
                    return `${msg.timestamp} [${msg.level}] - ${msg.message}`;
                }),
            ),
            transports: [
                new transports.DailyRotateFile({
                    level: 'info',
                    filename: 'logs/info/application-%DATE%.log',
                    datePattern: 'YYYY-MM-DD',
                    zippedArchive: true,
                    maxSize: '10m',
                    maxFiles: '14d',
                }),
                new transports.DailyRotateFile({
                    level: 'error',
                    filename: 'logs/error/application-%DATE%.log',
                    datePattern: 'YYYY-MM-DD',
                    zippedArchive: true,
                    maxSize: '10m',
                    maxFiles: '14d',
                }),
            ],
        }),
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_INTERCEPTOR,
            useClass: HTTPLoggingInterceptor,
        },
        // {
        //     provide: APP_FILTER,
        //     useClass: AllExceptionsFilter,
        // },
        {
            provide: APP_FILTER,
            useClass: TypeOrmExceptionFilter,
        },
    ],
})
export class AppModule {}
