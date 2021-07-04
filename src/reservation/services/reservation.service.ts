import { BadRequestException, Injectable, MethodNotAllowedException } from '@nestjs/common';
import { Reservation } from 'src/entities/reservation.entity';
import { Term } from 'src/entities/term.entity';
import { RegularScheduleService } from 'src/regular-schedule/regular-schedule.service';
import { TermService } from 'src/term/term.service';
import { In, InsertResult, LessThanOrEqual, MoreThanOrEqual, UpdateResult } from 'typeorm';
import { CreateReservationDto } from '../dto/create-reservation.dto';
import { ReservationQuery } from '../dto/reservation-query.dto';
import { ReservationRepository } from '../reservation.repository';
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
            (createReservationDto.startDate.valueOf() - createReservationDto.endDate.valueOf()) /
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

    async getReservationByQuery(query: ReservationQuery): Promise<Reservation[]> {
        return this.reservationRepository.find(query.getQuery);
    }
}
