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
import { CheckInService } from './check-in/check-in.service';
import { CheckInController } from './check-in/check-in.controller';
import { CheckInModule } from './check-in/check-in.module';

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
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
