import { BadRequestException, Inject, Injectable, MethodNotAllowedException } from '@nestjs/common';
import { ControlRepository } from 'src/control/control.repository';
import { ControlService } from 'src/control/control.service';
import { Reservation } from 'src/entities/reservation.entity';
import { Teacher } from 'src/entities/teacher.entity';
import { RegularScheduleService } from 'src/regular-schedule/regular-schedule.service';
import { TeacherService } from 'src/teacher/teacher.service';
import { TermService } from 'src/term/term.service';
import { InsertResult, UpdateResult } from 'typeorm';
import { AvailableSpotFilterDto } from '../dto/available-spot-filter.dto';
import { CreateReservationDto } from '../dto/create-reservation.dto';
import { ReservationFilterDto } from '../dto/reservation-filter.dto';
import { ReservationRepository } from '../reservation.repository';
import { ValidateReservationSerivce } from './validateReservation.service';

@Injectable()
export class ReservationService extends ValidateReservationSerivce {
    constructor(
        protected readonly reservationRepository: ReservationRepository,
        protected readonly termService: TermService,
        protected readonly regularScheduleService: RegularScheduleService,
        protected readonly teacherService: TeacherService,
        protected readonly controlService: ControlService,
    ) {
        super(reservationRepository, termService, regularScheduleService);
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

    async reserveMakeUpCourseByUser(
        createReservationDto: CreateReservationDto,
        userID: string,
    ): Promise<InsertResult> {
        var courseDuration =
            (createReservationDto.endDate.valueOf() - createReservationDto.startDate.valueOf()) /
            60000;

        const [isTimelineValid, isMakeUpAvailable, isTimeLineConflict] = await Promise.all([
            this.checkTimeLine(
                userID,
                createReservationDto.startDate,
                createReservationDto.endDate,
                createReservationDto.teacherID,
                createReservationDto.branchName,
            ),
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
        let makeUpCourse = new Reservation();
        makeUpCourse.setReservation(createReservationDto, userID, 1);
        return await this.reservationRepository.insert(makeUpCourse);
    }

    async reserveMakeUpCourseByAdmin(
        createReservationDto: CreateReservationDto,
        count: number,
    ): Promise<InsertResult> {
        if (!createReservationDto.userID) throw new BadRequestException('userID should be defined');
        const isConflict = await this.isTimeLineConflict(
            [createReservationDto.startDate],
            [createReservationDto.endDate],
            createReservationDto.teacherID,
        );
        let makeUpCourse = new Reservation();
        var status = -1;
        if (count === 1) status = 1;
        makeUpCourse.setReservation(createReservationDto, createReservationDto.userID, status);
        return await this.reservationRepository.insert(makeUpCourse);
    }

    async extendCourseByUser(courseInfo: Reservation, userID: string): Promise<UpdateResult> {
        const [isExtendAvailable, isTimeLineConflict] = await Promise.all([
            this.isMakeUpAvailable(userID, 15),
            this.isTimeLineConflict(
                [courseInfo.startDate],
                [courseInfo.endDate],
                courseInfo.teacherID,
                courseInfo.id,
            ),
        ]);
        return await this.reservationRepository.update(courseInfo.id, {
            bookingStatus: 3,
            endDate: courseInfo.endDate,
            extendedMin: courseInfo.extendedMin + 15,
        });
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
        var finalAvaliableSpot: Date[] = [];

        for (var i = 0; i < controlList.length; i++) {
            if (controlList[i].status === 1) {
                // class is closed
                for (var j = 0; j < teacherAvailableSpot.length; j++) {
                    if (
                        controlList[i].controlStart <= teacherAvailableSpot[j] &&
                        teacherAvailableSpot[j] < controlList[i].controlEnd
                    )
                        continue;
                    else {
                        finalAvaliableSpot.push(teacherAvailableSpot[j]);
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
                    finalAvaliableSpot.push(new Date(oepnStart.valueOf()));
                    oepnStart = new Date(oepnStart.getTime() + 30 * 60000);
                }
            }
        }
        var finalAvaliableSpot = finalAvaliableSpot
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
            for (var j = 0; j < finalAvaliableSpot.length; j++) {
                if (
                    bookedSpot[i].startDate <= finalAvaliableSpot[j] &&
                    finalAvaliableSpot[j] < bookedSpot[i].endDate
                ) {
                    finalAvaliableSpot.splice(j, 1);
                    j--;
                }
            }
        }
        return finalAvaliableSpot;
    }
}
