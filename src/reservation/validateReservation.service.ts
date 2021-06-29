import { BadRequestException, Injectable } from '@nestjs/common';
import { Term } from 'src/entities/term.entity';
import { RegularScheduleService } from 'src/regular-schedule/regular-schedule.service';
import { TermService } from 'src/term/term.service';
import { ReservationRepository } from './reservation.repository';

@Injectable()
export class ValidateReservationSerivce {
    constructor(
        protected readonly reservationRepository: ReservationRepository,
        protected readonly termService: TermService,
        protected readonly regularScheduleService: RegularScheduleService,
    ) {}

    protected async isCancelAvailable(userID: string): Promise<Boolean> {
        const termList: Term[] = await this.termService.getTerm();
        console.log(termList[0]);
        const res = await this.reservationRepository
            .createQueryBuilder()
            .leftJoin('Reservation.user', 'user')
            .addSelect(['user.userCredit'])
            .where('FK_RESERVATION_userID = :userID', { userID: userID })
            .andWhere('bookingStatus = 2')
            .andWhere('startDate >= :termStart', {
                termStart: termList[0].termStart,
            })
            .andWhere('endDate <= :termEnd', { termEnd: termList[0].termEnd })
            .getMany();
        console.log(res);
        //if result is [], then user does not cancel any class in current term
        //which means cancel is possible
        if (res?.length == 0 || res?.length < res[0]?.user?.userCredit) {
            return true;
        } else return false;
    }

    protected async checkTimeLine(
        userID: string,
        makeUpStartDate: Date,
        makeUpEndDate: Date,
        teacherID: string,
        branchName: string,
    ): Promise<number> {
        const res = await this.regularScheduleService.getRegularSechduleByUser(
            userID,
            makeUpStartDate,
        );
        makeUpStartDate = new Date(makeUpStartDate);
        makeUpEndDate = new Date(makeUpEndDate);
        for (var i = 0; i < res.length; i++) {
            console.log(res[i]);
            if (res[i].teacherID !== teacherID || res[i].branchName !== branchName)
                throw new BadRequestException(
                    'teacher and branch is not matched with regualr schedule',
                );
            if (
                (res[i].startDate.getUTCHours() < 16 && makeUpStartDate.getHours() < 16) ||
                (res[i].startDate.getUTCHours() >= 16 && makeUpStartDate.getHours() >= 16)
            ) {
                if (
                    (makeUpEndDate.valueOf() - makeUpStartDate.valueOf()) / 60000 ===
                    res[i].user.userDuration
                )
                    return res[i].user.userDuration;
                else throw new BadRequestException('course duration must match userDuration');
            }
        }
        throw new BadRequestException('TimeLine is Not Matched');
    }

    protected async isMakeUpAvailable(
        userID: string,
        makeUpStartDate: Date,
        makeUpEndDate: Date,
    ): Promise<boolean> {
        const termList: Term[] = await this.termService.getTerm();

        const res = await this.reservationRepository
            .createQueryBuilder()
            .where('FK_RESERVATION_userID = :userID', { userID: userID })
            .andWhere(
                `(bookingStatus = 2 OR bookingStatus = -2 OR bookingStatus = 1 OR 
                  (extendedMin != 0 AND bookingStatus = 3) )`,
            )
            .andWhere('startDate <= :startDate', { startDate: termList[1].termStart })
            .andWhere('endDate >= :endDate', { endDate: termList[0].termEnd })
            .getMany();
        var total: number = 0;
        for (var i = 0; i < res?.length; i++) {
            var diff = (res[i].endDate.valueOf() - res[i].startDate.valueOf()) / 60000;
            if (res[i].bookingStatus === 2 || res[i].bookingStatus === -2) {
                total += diff;
            } else if (res[i].bookingStatus === 1) {
                total -= diff;
            } else {
                if (res[i].isOriginal === 1) {
                    total -= res[i].extendedMin;
                } else {
                    total -= diff;
                }
            }
        }
        var courseDuration = (makeUpEndDate.valueOf() - makeUpStartDate.valueOf()) / 60000;
        if (total - courseDuration >= 0) return true;
        else return false;
    }
}
