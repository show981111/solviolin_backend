import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ControlModule } from 'src/control/control.module';
import { Reservation } from 'src/entities/reservation.entity';
import { RegularScheduleModule } from 'src/regular-schedule/regular-schedule.module';
import { TeacherModule } from 'src/teacher/teacher.module';
import { TermModule } from 'src/term/term.module';
import { ReservationController } from './reservation.controller';
import { RegularReservationService } from './services/regular-reservation.service';
import { ReservationService } from './services/reservation.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Reservation]),
        TermModule,
        RegularScheduleModule,
        ControlModule,
        TeacherModule,
    ],
    controllers: [ReservationController],
    providers: [ReservationService, RegularReservationService],
})
export class ReservationModule {}
