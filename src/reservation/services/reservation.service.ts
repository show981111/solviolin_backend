import { string } from '@hapi/joi';
import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    MethodNotAllowedException,
} from '@nestjs/common';
import { ControlService } from 'src/control/control.service';
import { Link } from 'src/entities/link.entity';
import { Reservation } from 'src/entities/reservation.entity';
import { Teacher } from 'src/entities/teacher.entity';
import { Term } from 'src/entities/term.entity';
import { RegularScheduleService } from 'src/regular-schedule/regular-schedule.service';
import { TeacherService } from 'src/teacher/teacher.service';
import { TermService } from 'src/term/term.service';
import {
    getManager,
    In,
    InsertResult,
    LessThanOrEqual,
    MoreThanOrEqual,
    Not,
    UpdateResult,
} from 'typeorm';
import { AvailableSpotFilterDto } from '../dto/available-spot-filter.dto';
import { CalculateIncomeDto } from '../dto/calculate-income.dto';
import { CreateReservationDto } from '../dto/create-reservation.dto';
import { ReservationFilterDto } from '../dto/reservation-filter.dto';
import { fromCourseInfo } from '../interfaces/from-course-info.interface';
import { Income } from '../interfaces/income.interface';
import { LinkRepository } from '../repositories/link.repository';
import { ReservationRepository } from '../repositories/reservation.repository';
import { ValidateReservationSerivce } from './validateReservation.service';

@Injectable()
export class ReservationService extends ValidateReservationSerivce {
    constructor(
        protected readonly reservationRepository: ReservationRepository,
        protected readonly linkRepository: LinkRepository,
        protected readonly termService: TermService,
        protected readonly regularScheduleService: RegularScheduleService,
        protected readonly teacherService: TeacherService,
        protected readonly controlService: ControlService,
    ) {
        super(reservationRepository, linkRepository, termService, regularScheduleService);
    }

    async cancelCourseByAdmin(id: number): Promise<UpdateResult> {
        return await this.reservationRepository.update(id, {
            bookingStatus: -2,
        });
    }

    async getCourseInfo(id: number) {
        return await this.reservationRepository.findOne(id);
    }

    async cancelCourseByUser(
        id: number,
        userID: string,
        cancelStartDate: Date,
    ): Promise<UpdateResult> {
        const res = await this.isCancelAvailable(userID, cancelStartDate);
        if (res) {
            return await this.reservationRepository.update(
                { id: id, userID: userID },
                { bookingStatus: 2 },
            );
        } else {
            throw new MethodNotAllowedException('exceeds maximum number of cancellation');
        }
    }

    async reserveMakeUpCourseFromCanceled(
        createReservationDto: CreateReservationDto,
        userID: string,
        fromAdmin: boolean,
    ): Promise<(InsertResult | UpdateResult[])[]> {
        var courseDuration =
            (createReservationDto.endDate.valueOf() - createReservationDto.startDate.valueOf()) /
            60000;
        var fromList: fromCourseInfo[];
        if (fromAdmin) {
            const [fromListRes, isTimeLineConflict] = await Promise.all([
                this.isMakeUpAvailable(
                    userID,
                    courseDuration,
                    createReservationDto.startDate,
                    createReservationDto.endDate,
                ),
                this.isTimeLineConflict(
                    [createReservationDto.startDate],
                    [createReservationDto.endDate],
                    createReservationDto.teacherID,
                ),
            ]);
            fromList = fromListRes;
        } else {
            const [fromListRes, checkTimeLine, isTimeLineConflict] = await Promise.all([
                this.isMakeUpAvailable(
                    userID,
                    courseDuration,
                    createReservationDto.startDate,
                    createReservationDto.endDate,
                ),
                this.checkTimeLine(
                    userID,
                    createReservationDto.startDate,
                    createReservationDto.endDate,
                    createReservationDto.teacherID,
                    createReservationDto.branchName,
                ),
                this.isTimeLineConflict(
                    [createReservationDto.startDate],
                    [createReservationDto.endDate],
                    createReservationDto.teacherID,
                ),
            ]);
            fromList = fromListRes;
        }

        var res = await getManager().transaction(async (transactionalEntityManager) => {
            let makeUpCourse = new Reservation();
            makeUpCourse.setReservation(createReservationDto, userID, 1);
            const makeUpCourseRes = await transactionalEntityManager
                .getRepository(Reservation)
                .insert(makeUpCourse);
            if (!makeUpCourseRes?.raw?.insertId)
                throw new InternalServerErrorException('insertID is null');

            var insertedLinkList: Link[] = [];
            var updateLinkList: Link[] = [];
            for (var i = 0; i < fromList.length; i++) {
                let link = new Link();
                link.from = fromList[i].from;
                link.isPostponed = fromList[i].isFromLast ? 1 : 0;
                link.used = fromList[i].using;
                link.toID = makeUpCourseRes.raw.insertId;
                if (fromList[i].isToNull) {
                    updateLinkList.push(link);
                } else {
                    insertedLinkList.push(link);
                }
            }
            var linkUpdateRes: UpdateResult[] = [];
            var linkInsertRes: InsertResult;
            if (updateLinkList.length > 0) {
                for (var i = 0; i < updateLinkList.length; i++) {
                    var updateResElem = await transactionalEntityManager
                        .getRepository(Link)
                        .update(
                            { fromID: updateLinkList[i].from.id, toID: null },
                            updateLinkList[i],
                        );
                    linkUpdateRes.push(updateResElem);
                }
            }
            if (insertedLinkList.length > 0) {
                linkInsertRes = await transactionalEntityManager
                    .getRepository(Link)
                    .insert(insertedLinkList);
            }

            return [makeUpCourseRes, linkInsertRes, linkUpdateRes];
        });

        return res;
    }

    async reserveNewClassByAdmin(
        createReservationDto: CreateReservationDto,
    ): Promise<InsertResult> {
        if (!createReservationDto.userID) throw new BadRequestException('userID should be defined');
        const isConflict = await this.isTimeLineConflict(
            [createReservationDto.startDate],
            [createReservationDto.endDate],
            createReservationDto.teacherID,
        );
        let makeUpCourse = new Reservation();
        makeUpCourse.setReservation(createReservationDto, createReservationDto.userID, -1);
        return await this.reservationRepository.insert(makeUpCourse);
    }

    async extendCourseByUser(
        courseInfo: Reservation,
        userID: string,
    ): Promise<(UpdateResult | InsertResult | UpdateResult[])[]> {
        const [fromList, isTimeLineConflict] = await Promise.all([
            this.isMakeUpAvailable(userID, 15, courseInfo.startDate, courseInfo.endDate),
            this.isTimeLineConflict(
                [courseInfo.startDate],
                [courseInfo.endDate],
                courseInfo.teacherID,
                courseInfo.id,
            ),
        ]);
        console.log('fromList ', fromList);
        var res = await getManager().transaction(async (transactionalEntityManager) => {
            var insertedLinkList: Link[] = [];
            var updateLinkList: Link[] = [];
            for (var i = 0; i < fromList.length; i++) {
                let link = new Link();
                link.from = fromList[i].from;
                link.isPostponed = fromList[i].isFromLast ? 1 : 0;
                link.used = fromList[i].using;
                link.toID = courseInfo.id;
                if (fromList[i].isToNull) {
                    updateLinkList.push(link);
                } else {
                    insertedLinkList.push(link);
                }
            }
            console.log('updateLinkList ', updateLinkList);
            console.log('insertLinkList ', insertedLinkList);
            var linkUpdateRes: UpdateResult[] = [];
            var linkInsertRes: InsertResult;
            if (updateLinkList.length > 0) {
                for (var i = 0; i < updateLinkList.length; i++) {
                    var updateResElem = await transactionalEntityManager
                        .getRepository(Link)
                        .update(
                            { fromID: updateLinkList[i].from.id, toID: null },
                            updateLinkList[i],
                        );
                    linkUpdateRes.push(updateResElem);
                }
            }
            if (insertedLinkList.length > 0) {
                linkInsertRes = await transactionalEntityManager
                    .getRepository(Link)
                    .insert(insertedLinkList);
            }
            if (linkUpdateRes?.length > 0) {
                for (var i = 0; i < linkUpdateRes.length; i++) {
                    if (linkUpdateRes[i].affected < 1) {
                        throw new InternalServerErrorException('Link is not updated');
                    }
                }
            }
            const updateRes = await transactionalEntityManager
                .getRepository(Reservation)
                .update(courseInfo.id, {
                    bookingStatus: 3,
                    endDate: courseInfo.endDate,
                    extendedMin: courseInfo.extendedMin + 15,
                });
            return [linkUpdateRes, linkInsertRes, updateRes];
        });

        return res;
    }

    async extendCourseByAdmin(courseInfo: Reservation, count: number): Promise<UpdateResult> {
        const isTimeLineConflict = await this.isTimeLineConflict(
            [courseInfo.startDate],
            [courseInfo.endDate],
            courseInfo.teacherID,
            courseInfo.id,
        );
        var status = -3;
        if (count === 1) status = 3;
        return await this.reservationRepository.update(courseInfo.id, {
            bookingStatus: status,
            endDate: courseInfo.endDate,
            extendedMin: courseInfo.extendedMin + 15,
        });
    }

    async getReservationByFilter(query: ReservationFilterDto): Promise<Reservation[]> {
        return this.reservationRepository.find(query.getFilter);
    }

    //1. 선생 시간표 받아서 2. open 열고 3. close 닫고 4. 수업있는곳 닫고
    async getAvailableSpotByFilter(filter: AvailableSpotFilterDto): Promise<Date[]> {
        const teacherWorkSlot: Teacher[] = await this.teacherService.getWorkSlotAtDate(
            filter.teacherID,
            filter.branchName,
            filter.startDate.getDay(),
        );
        var teacherAvailableSpot: Date[] = [];
        var date = new Date(filter.startDate.setHours(0, 0, 0, 0));
        for (var i = 0; i < teacherWorkSlot.length; i++) {
            var spotStart = new Date(
                `${date.getUTCFullYear()}/${date.getUTCMonth() + 1}/${date.getUTCDate()} ${
                    teacherWorkSlot[i].startTime
                }`,
            );
            var spotEnd = new Date(
                `${date.getUTCFullYear()}/${date.getUTCMonth() + 1}/${date.getUTCDate()} ${
                    teacherWorkSlot[i].endTime
                }`,
            );
            while (spotStart < spotEnd) {
                teacherAvailableSpot.push(new Date(spotStart.valueOf()));
                spotStart = new Date(spotStart.getTime() + 30 * 60000);
            }
        }
        const controlList = await this.controlService.getControlContainsDate(
            filter.teacherID,
            filter.branchName,
            date,
        );

        for (var i = 0; i < controlList.length; i++) {
            if (controlList[i].status === 1) {
                // class is closed
                for (var j = 0; j < teacherAvailableSpot.length; j++) {
                    if (
                        controlList[i].controlStart <= teacherAvailableSpot[j] &&
                        teacherAvailableSpot[j] < controlList[i].controlEnd
                    ) {
                        teacherAvailableSpot.splice(j, 1); //if class is closed, remove the element
                        j--;
                    }
                }
            } else {
                // class is opened
                var oepnStart: Date;
                if (controlList[i].controlStart <= date) {
                    //if control start is before the date, class start from 09:00
                    oepnStart = new Date(filter.startDate.setHours(9, 0, 0, 0));
                } else {
                    oepnStart = controlList[i].controlStart;
                }

                while (oepnStart < controlList[i].controlEnd) {
                    teacherAvailableSpot.push(new Date(oepnStart.valueOf()));
                    oepnStart = new Date(oepnStart.getTime() + 30 * 60000);
                }
            }
        }
        var teacherAvailableSpot = teacherAvailableSpot //중복제거
            .map((s) => s.getTime())
            .filter((s, i, a) => a.indexOf(s) == i)
            .map((s) => new Date(s));

        const bookedSpot = await this.reservationRepository
            .createQueryBuilder()
            .where(
                `FK_RESERVATION_teacherID = :teacherID AND FK_RESERVATION_branch = :branchName AND
            DATE(startDate) = :criterion AND bookingStatus != -2 AND bookingStatus != 2`,
                {
                    teacherID: filter.teacherID,
                    branchName: filter.branchName,
                    criterion: `${date.getUTCFullYear()}/${
                        date.getUTCMonth() + 1
                    }/${date.getUTCDate()}`,
                },
            )
            .getMany();

        for (var i = 0; i < bookedSpot.length; i++) {
            for (var j = 0; j < teacherAvailableSpot.length; j++) {
                if (
                    bookedSpot[i].startDate <= teacherAvailableSpot[j] &&
                    teacherAvailableSpot[j] < bookedSpot[i].endDate
                ) {
                    teacherAvailableSpot.splice(j, 1);
                    j--;
                }
            }
        }
        return teacherAvailableSpot;
    }

    async getChangeList(userID: string, range: string): Promise<Link[]> {
        const termList: Term[] = await this.termService.getTerm();
        var startDate: Date, endDate: Date;
        if (range === 'cur') {
            startDate = termList[0].termStart;
            endDate = termList[0].termEnd;
        } else if (range === 'last') {
            startDate = termList[1].termStart;
            endDate = termList[1].termEnd;
        } else {
            startDate = termList[1].termStart;
            endDate = termList[0].termEnd;
        }
        const changeListInDate = await this.linkRepository
            .createQueryBuilder()
            .leftJoinAndSelect('Link.from', 'from')
            .leftJoinAndSelect('Link.to', 'to')
            .where('from.FK_RESERVATION_userID = :userID', { userID: userID })
            .andWhere(
                `( (from.startDate >= :startDate AND from.endDate <= :endDate) OR 
                        (to.startDate >= :startDate AND to.endDate <= :endDate) )`,
                {
                    startDate: startDate,
                    endDate: endDate,
                },
            )
            .orderBy('from.startDate', 'ASC')
            .getMany();
        return changeListInDate;
    }

    async calculateSalary(calculateIncomeDto: CalculateIncomeDto): Promise<Map<string, Income>> {
        const termInfo = await this.termService.getTermById(calculateIncomeDto.termID);
        const courseInCondtion = await this.reservationRepository.find({
            branchName: calculateIncomeDto.branchName,
            startDate: MoreThanOrEqual(termInfo.termStart),
            endDate: LessThanOrEqual(termInfo.termEnd),
            bookingStatus: In([-3, -1, 0, 1, 3]),
            userID: Not('break'),
        });
        var incomeMap = new Map<string, Income>();
        for (var i = 0; i < courseInCondtion.length; i++) {
            var duration: number =
                (courseInCondtion[i].endDate.getTime() - courseInCondtion[i].startDate.getTime()) /
                60000;

            if (incomeMap.has(courseInCondtion[i].teacherID)) {
                if (courseInCondtion[i].startDate.getHours() < 16) {
                    incomeMap.get(courseInCondtion[i].teacherID).dayTime += duration;
                    incomeMap.get(courseInCondtion[i].teacherID).income +=
                        (duration * calculateIncomeDto.dayTimeCost) / 60;
                } else {
                    incomeMap.get(courseInCondtion[i].teacherID).nightTime += duration;
                    incomeMap.get(courseInCondtion[i].teacherID).income +=
                        (duration * calculateIncomeDto.nightTimeCost) / 60;
                }
            } else {
                if (courseInCondtion[i].startDate.getHours() < 16) {
                    incomeMap.set(courseInCondtion[i].teacherID, {
                        dayTime: duration,
                        nightTime: 0,
                        income: (duration * calculateIncomeDto.dayTimeCost) / 60,
                    });
                } else {
                    incomeMap.set(courseInCondtion[i].teacherID, {
                        dayTime: 0,
                        nightTime: duration,
                        income: (duration * calculateIncomeDto.nightTimeCost) / 60,
                    });
                }
            }
        }

        return incomeMap;
    }
}
