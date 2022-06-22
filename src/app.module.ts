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
import { LedgerModule } from './ledger/ledger.module';
import { Database, Resource } from '@adminjs/typeorm';
import AdminJS from 'adminjs';
import { validate } from 'class-validator';
import { AdminModule } from '@adminjs/nestjs'; // lib
import { User } from './entities/user.entity';
import { Branch } from './entities/branch.entity';
import { CheckIn } from 'src/entities/check-in.entity';
import { Control } from 'src/entities/control.entity';
import { Ledger } from 'src/entities/ledger.entity';
import { Link } from 'src/entities/link.entity';
import { RegularSchedule } from 'src/entities/regularSchedule.entity';
import { Reservation } from 'src/entities/reservation.entity';
import { Teacher } from 'src/entities/teacher.entity';
import { TeacherID } from 'src/entities/teacherID.entity';
import { Term } from 'src/entities/term.entity';
import { Verification } from './entities/verification.entity';

Resource.validate = validate;
AdminJS.registerAdapter({ Database, Resource });

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
                    maxSize: '5000000',
                    maxFiles: '5',
                }),
                new transports.DailyRotateFile({
                    level: 'error',
                    filename: 'logs/error/application-%DATE%.log',
                    datePattern: 'YYYY-MM-DD',
                    zippedArchive: true,
                    maxSize: '5000000',
                    maxFiles: '5',
                }),
            ],
        }),
        LedgerModule,
        AdminModule.createAdminAsync({
            useFactory: () => ({
                adminJsOptions: {
                    rootPath: '/admin',
                    resources: [
                        User,
                        Branch,
                        CheckIn,
                        Control,
                        Ledger,
                        Link,
                        RegularSchedule,
                        Reservation,
                        Teacher,
                        TeacherID,
                        Term,
                        Verification,
                    ],
                },

                auth: {
                    authenticate: async (email, password) =>
                        new Promise((resolve, reject) => {
                            if (
                                email === process.env.ADMIN_ID &&
                                password === process.env.ADMIN_PW
                            ) {
                                resolve({ email: process.env.ADMIN_ID });
                            } else {
                                resolve(null);
                            }
                        }),
                    cookieName: process.env.ADMIN_ID,
                    cookiePassword: process.env.ADMIN_COOKIE,
                },
            }),
        }),
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_INTERCEPTOR,
            useClass: HTTPLoggingInterceptor,
        },
        {
            provide: APP_FILTER,
            useClass: AllExceptionsFilter,
        },
        {
            provide: APP_FILTER,
            useClass: TypeOrmExceptionFilter,
        },
    ],
})
export class AppModule {}
