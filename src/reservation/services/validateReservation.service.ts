import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    PreconditionFailedException,
} from '@nestjs/common';
import { from } from 'rxjs';
import { Link } from 'src/entities/link.entity';
import { Reservation } from 'src/entities/reservation.entity';
import { Term } from 'src/entities/term.entity';
import { RegularScheduleService } from 'src/regular-schedule/regular-schedule.service';
import { TermService } from 'src/term/term.service';
import { Brackets } from 'typeorm';
import { fromCourseInfo } from '../interfaces/from-course-info.interface';
import { fromToLink } from '../interfaces/from-to-link.interface';
import { LinkRepository } from '../repositories/link.repository';
import { ReservationRepository } from '../repositories/reservation.repository';

@Injectable()
export class ValidateReservationSerivce {
    constructor(
        protected readonly reservationRepository: ReservationRepository,
        protected readonly linkRepository: LinkRepository,
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
        userID: string, //
        makeUpStartDate: Date,
        makeUpEndDate: Date,
        teacherID: string,
        branchName: string,
    ): Promise<number> {
        const res = await this.regularScheduleService.getRegularSechduleByUser(
            userID,
            makeUpStartDate,
        );

        //?????? ?????? ????????? ???????????? ?????? ????????????. ?????? ??????????????? ?????? ??????????????? ??????????????????.
        var isTeacherBranchMatch: boolean = false;
        var isDurationMatch: boolean = false;
        var isTimeLineMatch: boolean = false;
        for (var i = 0; i < res.length; i++) {
            var dummyStartDateTime = new Date('1998-11-11 ' + res[i].startTime);
            var dummyEndDateTime = new Date('1998-11-11 ' + res[i].endTime);
            var regularClassDuration: number =
                (dummyEndDateTime.valueOf() - dummyStartDateTime.valueOf()) / 60000;
            //should find the regular schedule that contents all conditions.

            isTeacherBranchMatch = false;
            isTimeLineMatch = false;
            isDurationMatch = false;

            if (res[i].teacherID === teacherID && res[i].branchName === branchName) {
                isTeacherBranchMatch = true;
            }

            var startTimeNumber = new Date('1998-11-11 ' + res[i].startTime).getHours();
            var startDay: number = res[i].dow;
            console.log(res[i]);
            console.log(startDay, ' ', startTimeNumber);
            console.log(
                'makeUpdate',
                makeUpStartDate,
                ' ',
                makeUpStartDate.getHours(),
                ' ',
                makeUpStartDate.getDay(),
            );
            if (startDay >= 1 && startDay <= 5 && startTimeNumber < 16) {
                // ?????? ???
                console.log('week day');
                if (
                    makeUpStartDate.getHours() < 16 &&
                    makeUpStartDate.getDay() >= 1 && //?????? ?????? ??????
                    makeUpStartDate.getDay() <= 5
                ) {
                    isTimeLineMatch = true;
                }
            } else {
                console.log('other');
                //?????? ?????? ?????? ??????
                isTimeLineMatch = true;
            }

            if (
                (makeUpEndDate.valueOf() - makeUpStartDate.valueOf()) / 60000 ===
                regularClassDuration
            ) {
                isDurationMatch = true;
            }

            if (isTeacherBranchMatch && isTimeLineMatch && isDurationMatch)
                return regularClassDuration;
        }

        if (!isTeacherBranchMatch)
            throw new BadRequestException(
                'teacher and branch is not matched with regular schedule',
            );
        if (!isTimeLineMatch) throw new BadRequestException('TimeLine is Not Matched');
        if (!isDurationMatch)
            throw new BadRequestException('course duration must match userDuration');
    }

    public async isMakeUpAvailable(
        // ??????,?????? ?????? ??? ????????? ??????  - ?????? ?????? ????????? ?????? = ?????? ?????? ?????? ?????? +
        userID: string,
        courseDuration: number,
        startDate?: Date,
        endDate?: Date,
        isAdmin?: boolean,
    ): Promise<fromCourseInfo[]> {
        //fromCourseInfo[]
        const termList: Term[] = await this.termService.getTerm(startDate);

        if (startDate && endDate) {
            if (
                !(termList[0].termStart <= startDate && endDate <= termList[0].termEnd) &&
                !isAdmin
            ) {
                throw new BadRequestException('only possible to reserve course from this term');
            }
        }

        const canceledCourseInLastAndCur = await this.linkRepository
            .createQueryBuilder()
            .leftJoinAndSelect('Link.from', 'from')
            .leftJoinAndSelect('Link.to', 'to')
            .where('from.FK_RESERVATION_userID = :userID', { userID: userID })
            .andWhere('from.startDate >= :lastTermStart AND from.endDate <= :curTermEnd', {
                lastTermStart: termList[1].termStart,
                curTermEnd: termList[0].termEnd,
            })
            .orderBy('from.startDate', 'ASC')
            .getMany();
        var bank = new Map<number, fromToLink>();
        var postPoneUsed = false;
        // console.log('canceledCourseInLastAndCur', canceledCourseInLastAndCur);
        for (var i = 0; i < canceledCourseInLastAndCur.length; i++) {
            var residue = this.getResidueMinute(
                canceledCourseInLastAndCur[i].from,
                canceledCourseInLastAndCur[i].used,
            );

            if (isCanaceledFromLast) {
                //????????????????????? ????????? ????????? ????????? ????????? ?????? ??????
                residue -= canceledCourseInLastAndCur[i].from.extendedMin;
            }

            var isCanaceledFromLast = this.isInTerm(
                termList[1],
                canceledCourseInLastAndCur[i].from,
            );

            if (canceledCourseInLastAndCur[i].isPostponed) {
                // ?????? ????????? ????????? ????????? ????????? ????????? ?????? ????????? ????????? ??????.
                postPoneUsed = true; //?????? ????????? ???????????? ??????????????????????????? ????????? ????????? ????????? ??? ????????? ??????.
                bank.clear();
                bank.set(canceledCourseInLastAndCur[i].fromID, {
                    from: canceledCourseInLastAndCur[i].from,
                    to: [canceledCourseInLastAndCur[i].to],
                    isCanceledFromLast: isCanaceledFromLast,
                    residue: residue,
                });
                continue;
            }

            if (bank.has(canceledCourseInLastAndCur[i].fromID)) {
                // console.log(
                //     'to is inserted to ' + canceledCourseInLastAndCur[i].fromID,
                //     canceledCourseInLastAndCur[i].to,
                // );
                //already exist at the bank : push to the "to" Array AND subtract used Time
                bank.get(canceledCourseInLastAndCur[i].fromID).to.push(
                    canceledCourseInLastAndCur[i].to,
                );
                bank.get(canceledCourseInLastAndCur[i].fromID).residue -=
                    canceledCourseInLastAndCur[i].used;
            } else {
                //does not has a class at the bank : set a key and residue.
                var residue = this.getResidueMinute(
                    canceledCourseInLastAndCur[i].from,
                    canceledCourseInLastAndCur[i].used,
                );

                if (postPoneUsed && isCanaceledFromLast) continue; //?????? ????????? ????????? ?????? ?????????, ?????? ????????? ????????? ???????????? ??????.

                bank.set(canceledCourseInLastAndCur[i].fromID, {
                    from: canceledCourseInLastAndCur[i].from,
                    to: [canceledCourseInLastAndCur[i].to],
                    isCanceledFromLast: isCanaceledFromLast,
                    residue: residue,
                });
            }
        }

        if (!postPoneUsed) {
            //????????? ????????? ???????????? ????????????, ?????? ???????????? ????????? ?????? ??????. ?????? ???????????? ????????? ????????? ?????? ???????????? ????????? ????????????!
            var previousMax: number = 0;
            var maxDuration: number = 0;
            for (const [key, value] of bank.entries()) {
                if (value.isCanceledFromLast) {
                    // console.log(key, value.residue);
                    if (value.residue > maxDuration) {
                        maxDuration = value.residue;
                        bank.delete(previousMax);
                        previousMax = key;
                    } else {
                        bank.delete(key);
                    }
                } else break;
            }
        }
        var selectedFromList: fromCourseInfo[] = [];
        var fromTotalDuration: number = 0;

        for (const [key, value] of bank.entries()) {
            // console.log(key, value);
            if (value.residue === courseDuration) {
                // ????????? ???????????? ???????????? ????????? ????????? ???????????? ?????? ??????.
                selectedFromList = [
                    {
                        from: value.from,
                        using: value.residue,
                        isFromLast: value.isCanceledFromLast,
                        isToNull: value.to?.length > 0 && value.to[0] ? 0 : 1,
                    },
                ];
                fromTotalDuration = value.residue;
                // console.log('*********selectedFromList is set to ', value);
                break;
            }
            if (fromTotalDuration < courseDuration && value.residue > 0) {
                var usingDuration = value.residue;
                if (value.residue > courseDuration) usingDuration = courseDuration;
                //??????????????? ?????? ??????????????? ??? ??????????????? ?????? ?????????????????? ??????
                selectedFromList.push({
                    from: value.from,
                    using: usingDuration,
                    isFromLast: value.isCanceledFromLast,
                    isToNull: value.to?.length > 0 && value.to[0] ? 0 : 1,
                });
                // console.log('*********selectedFromList get Value ', value);
                fromTotalDuration += usingDuration;
            }
        }
        // console.log('fromTotalDuration', fromTotalDuration);
        if (fromTotalDuration < courseDuration || selectedFromList?.length === 0) {
            //????????????????????? ?????? ?????? ??????????????? ??? ???????????? ?????? ?????? ????????????
            throw new PreconditionFailedException(
                'makeUp or Extend is not available(cancel more class please)',
            );
        }

        return selectedFromList;
    }
    private isInTerm(term: Term, reservation: Reservation): boolean {
        if (!reservation || !term) return false;
        if (term.termStart <= reservation.startDate && reservation.startDate <= term.termEnd)
            return true;
        else return false;
    }
    private getResidueMinute(from: Reservation, used: number): number {
        if (!from) return 0;
        var fromDuration = (from.endDate.getTime() - from.startDate.getTime()) / 60000;
        fromDuration -= used;
        return fromDuration; //?????? ?????? ?????????????????? ????????? ????????? ?????? ?????? ??????.
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
