import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from 'src/entities/reservation.entity';
import { RegularScheduleModule } from 'src/regular-schedule/regular-schedule.module';
import { TermModule } from 'src/term/term.module';
import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Reservation]),
        TermModule,
        RegularScheduleModule,
    ],
    controllers: [ReservationController],
    providers: [ReservationService],
})
export class ReservationModule {}
