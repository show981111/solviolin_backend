import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    MethodNotAllowedException,
    NotFoundException,
} from '@nestjs/common';
import { Reservation } from 'src/entities/reservation.entity';
import { Term } from 'src/entities/term.entity';
import { RegularScheduleService } from 'src/regular-schedule/regular-schedule.service';
import { TermService } from 'src/term/term.service';
import { InsertResult, UpdateResult } from 'typeorm';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationRepository } from './reservation.repository';
import { ValidateReservationSerivce } from './validateReservation.service';

@Injectable()
export class ReservationService extends ValidateReservationSerivce {
    constructor(
        protected readonly reservationRepository: ReservationRepository,
        protected readonly termService: TermService,
        protected readonly regularScheduleService: RegularScheduleService,
    ) {
        super(reservationRepository, termService, regularScheduleService);
    }

    async cancelCourseByAdmin(id: number): Promise<UpdateResult> {
        return await this.reservationRepository.update(id, {
            bookingStatus: -2,
        });
    }

    async cancelCourseByUser(id: number, userID: string): Promise<UpdateResult> {
        const res = await this.isCancelAvailable(userID);
        if (res) {
            return await this.reservationRepository.update(
                { id: id, userID: userID },
                { bookingStatus: 2 },
            );
        } else {
            throw new MethodNotAllowedException('exceeds maximum number of cancellation');
        }
    }

    async reserveMakeUpCourseByUser(
        createReservationDto: CreateReservationDto,
        userID: string, //: Promise<InsertResult>
    ) {
        const [isTimelineValid, isMakeUpAvailable] = await Promise.all([
            this.checkTimeLine(
                userID,
                createReservationDto.startDate,
                createReservationDto.endDate,
                createReservationDto.teacherID,
                createReservationDto.branchName,
            ),
            this.isMakeUpAvailable(
                userID,
                createReservationDto.startDate,
                createReservationDto.endDate,
            ),
        ]);
        if (!isTimelineValid) throw new BadRequestException('timeline should be matched');
        if (!isMakeUpAvailable) throw new BadRequestException('MakeUpCourse is not available');
        return 'Availabiltiy pass';
    }
}
