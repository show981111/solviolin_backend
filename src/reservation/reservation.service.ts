import {
    ForbiddenException,
    Injectable,
    MethodNotAllowedException,
    NotFoundException,
} from '@nestjs/common';
import { Reservation } from 'src/entities/reservation.entity';
import { Term } from 'src/entities/term.entity';
import { TermService } from 'src/term/term.service';
import { UpdateResult } from 'typeorm';
import { ReservationRepository } from './reservation.repository';

@Injectable()
export class ReservationService {
    constructor(
        private readonly reservationRepository: ReservationRepository,
        private readonly termService: TermService,
    ) {}

    private async isCancelAvailable(userID: string): Promise<Boolean> {
        const termList: Term[] = await this.termService.getTerm();
        console.log(termList[0]);
        const res = await this.reservationRepository
            .createQueryBuilder()
            .leftJoin('Reservation.user', 'user')
            .select([
                'Reservation.id',
                'Reservation.userID',
                'Reservation.startDate',
                'Reservation.endDate',
                'Reservation.teacherID',
                'Reservation.branchName',
                'Reservation.bookingStatus',
                'Reservation.extendedMin',
                'user.userCredit',
            ])
            .where('FK_RESERVATION_userID = :userID', { userID: userID })
            .andWhere('bookingStatus = -1')
            .andWhere('startDate >= :termStart', {
                termStart: termList[0].termStart,
            })
            .andWhere('endDate <= :termEnd', { termEnd: termList[0].termEnd })
            .getMany();
        //if result is [], then user does not cancel any class in current term
        //which means cancel is possible
        if (res?.length == 0 || res?.length < res[0]?.user?.userCredit) {
            return true;
        } else return false;
    }

    async cancelCourseByAdmin(id: number): Promise<UpdateResult> {
        return await this.reservationRepository.update(id, {
            bookingStatus: -2,
        });
    }

    async cancelCourseByUser(
        id: number,
        userID: string,
    ): Promise<UpdateResult> {
        const res = await this.isCancelAvailable(userID);
        if (res) {
            return await this.reservationRepository.update(
                { id: id, userID: userID },
                { bookingStatus: -1 },
            );
        } else {
            throw new MethodNotAllowedException(
                'exceed maximum number of cancellation',
            );
        }
    }
}
