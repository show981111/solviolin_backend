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
import { TeacherModule } from './teacher/teacher.module';
import { Control } from './entities/control.entity';
import { Teacher } from './entities/teacher.entity';
import { TeacherID } from './entities/teacherID.entity';
import { ControlModule } from './control/control.module';
import { ReservationModule } from './reservation/reservation.module';
import { Reservation } from './entities/reservation.entity';
import { Term } from './entities/term.entity';
import { TermModule } from './term/term.module';
import { RegularSchedule } from './entities/regularSchedule.entity';
import { RegularScheduleModule } from './regular-schedule/regular-schedule.module';
import { BranchController } from './branch/branch.controller';
import { BranchService } from './branch/branch.service';
import { BranchModule } from './branch/branch.module';

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
                entities: [
                    User,
                    Branch,
                    Control,
                    Teacher,
                    TeacherID,
                    Reservation,
                    Term,
                    RegularSchedule,
                ],
                // synchronize: true,
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
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
