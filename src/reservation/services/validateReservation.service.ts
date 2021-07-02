import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { Term } from 'src/entities/term.entity';
import { RegularScheduleService } from 'src/regular-schedule/regular-schedule.service';
import { TermService } from 'src/term/term.service';
import { Brackets } from 'typeorm';
import { ReservationRepository } from '../reservation.repository';

@Injectable()
export class ValidateReservationSerivce {
    constructor(
        protected readonly reservationRepository: ReservationRepository,
        protected readonly termService: TermService,
        protected readonly regularScheduleService: RegularScheduleService,
    ) {}

    protected async isCancelAvailable(userID: string, cancelStartDate: Date): Promise<Boolean> {
        const termList: Term[] = await this.termService.getTerm();
        if (!(termList[0].termStart <= cancelStartDate && cancelStartDate <= termList[0].termEnd)) {
            throw new ForbiddenException(
                'cannot cancel course from other terms besides current term',
            );
        }
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
            if (res[i].teacherID !== teacherID || res[i].branchName !== branchName)
                throw new BadRequestException(
                    'teacher and branch is not matched with regualr schedule',
                );
            var startTimeNumber = new Date('1998-11-11' + res[i].startTime).getUTCHours();
            if (
                (startTimeNumber < 16 && makeUpStartDate.getHours() < 16) ||
                (startTimeNumber >= 16 && makeUpStartDate.getHours() >= 16)
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
        courseDuration: number,
        startDate?: Date,
        endDate?: Date,
    ): Promise<boolean> {
        const termList: Term[] = await this.termService.getTerm();
        if (startDate && endDate) {
            if (!(termList[0].termStart <= startDate && endDate <= termList[0].termEnd)) {
                throw new BadRequestException('only possible to reserve course from this term');
            }
        }
        const res = await this.reservationRepository
            .createQueryBuilder()
            .where('FK_RESERVATION_userID = :userID', { userID: userID })
            .andWhere(
                `(bookingStatus = 2 OR bookingStatus = -2 OR bookingStatus = 1 OR 
                  (extendedMin != 0 AND bookingStatus = 3) )`,
            )
            .andWhere(':termStartDate <= startDate', { termStartDate: termList[1].termStart })
            .andWhere(':termEndDate >= endDate', { termEndDate: termList[0].termEnd })
            .getMany();
        var total: number = 0;
        for (var i = 0; i < res?.length; i++) {
            var diff = (res[i].endDate.valueOf() - res[i].startDate.valueOf()) / 60000;
            if (res[i].bookingStatus === 2 || res[i].bookingStatus === -2) {
                total += diff;
            } else if (res[i].bookingStatus === 1) {
                total -= diff;
            } else {
                if (res[i].regularID) {
                    total -= res[i].extendedMin;
                } else {
                    total -= diff; // if regular is null, then not a original
                }
            }
        }
        if (total - courseDuration >= 0) return true;
        else throw new BadRequestException('MakeUpCourse is not available');
    }

    protected async isTimeLineConflict(
        startDate: Date[],
        endDate: Date[],
        teacher: string,
        id?: number,
    ): Promise<boolean> {
        var dateOrCondition = new Brackets((qb) => {
            for (var i = 0; i < startDate.length; i++) {
                qb = qb.orWhere(
                    `( (startDate <= '${startDate[i].toISOString()}' 
                    AND '${startDate[i].toISOString()}' < endDate) 
                    OR 
                    (startDate < '${endDate[i].toISOString()}' 
                    AND '${endDate[i].toISOString()}' <= endDate) )`,
                );
            }
        });
        const res = await this.reservationRepository
            .createQueryBuilder()
            .where('FK_RESERVATION_teacherID = :teacher', { teacher: teacher })
            .andWhere('(bookingStatus != 2 AND bookingStatus != -2)')
            .andWhere(dateOrCondition)
            .andWhere('id != :id', { id: id ? id : -1 })
            .getOne();

        if (res)
            throw new ConflictException('timeslot was already occupied by \n' + res.toString());
        else return false;
    }
}
