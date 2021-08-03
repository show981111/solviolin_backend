import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ControlModule } from 'src/control/control.module';
import { ControlRepository } from 'src/control/control.repository';
import { ControlService } from 'src/control/control.service';
import { RegularScheduleModule } from 'src/regular-schedule/regular-schedule.module';
import { TeacherModule } from 'src/teacher/teacher.module';
import { TermModule } from 'src/term/term.module';
import { UserModule } from 'src/user/user.module';
import { ReservationController } from './reservation.controller';
import { ReservationRepository } from './repositories/reservation.repository';
import { RegularReservationService } from './services/regular-reservation.service';
import { ReservationService } from './services/reservation.service';
import { LinkRepository } from './repositories/link.repository';
import { RegularReservationController } from './regularReservation.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([ReservationRepository]),
        TypeOrmModule.forFeature([LinkRepository]),
        TermModule,
        RegularScheduleModule,
        TeacherModule,
        ControlModule,
    ],
    controllers: [ReservationController, RegularReservationController],
    providers: [ReservationService, RegularReservationService],
})
export class ReservationModule {}
