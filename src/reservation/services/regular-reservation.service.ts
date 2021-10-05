import {
    BadRequestException,
    Injectable,
    MethodNotAllowedException,
    PreconditionFailedException,
} from '@nestjs/common';
import { ControlService } from 'src/control/control.service';
import { Branch } from 'src/entities/branch.entity';
import { RegularSchedule } from 'src/entities/regularSchedule.entity';
import { Reservation } from 'src/entities/reservation.entity';
import { TeacherID } from 'src/entities/teacherID.entity';
import { Term } from 'src/entities/term.entity';
import { CreateRegularDto } from 'src/regular-schedule/dto/create-regular.dto';
import { RegularScheduleService } from 'src/regular-schedule/regular-schedule.service';
import { TeacherService } from 'src/teacher/teacher.service';
import { CreateTermDto } from 'src/term/dto/create-term.dto';
import { TermService } from 'src/term/term.service';
import { TeacherBranchQuery } from 'src/utils/interface/Teacher-Branch-Query.interface';
import {
    DeleteResult,
    FindConditions,
    InsertResult,
    LessThanOrEqual,
    MoreThan,
    MoreThanOrEqual,
} from 'typeorm';
import { UpdateEndRegularDto } from '../dto/update-end-regular.dto';
import { LinkRepository } from '../repositories/link.repository';
import { ReservationRepository } from '../repositories/reservation.repository';
import { ValidateReservationSerivce } from './validateReservation.service';

@Injectable()
export class RegularReservationService extends ValidateReservationSerivce {
    constructor(
        protected readonly reservationRepository: ReservationRepository,
        protected readonly linkRepository: LinkRepository,
        protected readonly termService: TermService,
        protected readonly regularScheduleService: RegularScheduleService,
        protected readonly teacherService: TeacherService,
    ) {
        super(reservationRepository, linkRepository, termService, regularScheduleService);
    }

    async registerRegularAndReservation(createRegularDto: CreateRegularDto): Promise<InsertResult> {
        const query: TeacherBranchQuery = {
            branch: new Branch(createRegularDto.branchName),
            teacher: new TeacherID(createRegularDto.teacherID),
        };
        const teacherInfo = await this.teacherService.getWorkSlot(
            query,
            createRegularDto.startDate,
            createRegularDto.endDate,
        );
        if (!teacherInfo)
            throw new PreconditionFailedException(
                'timeslot is not available(Teacher is not working at the time)',
            );
        const termList = await this.termService.getTerm(createRegularDto.startDate);
        const termEnd = termList[0].termEnd;
        const termID = termList[0].id;
        console.log(createRegularDto);

        var startDateList: Date[] = [new Date(createRegularDto.startDate.valueOf())];
        var endDateList: Date[] = [new Date(createRegularDto.endDate.valueOf())];

        var finalStartDate = new Date(createRegularDto.startDate.valueOf());
        var finalEndDate = new Date(createRegularDto.endDate.valueOf());
        while (finalEndDate <= termEnd) {
            finalStartDate.setDate(finalStartDate.getDate() + 7);
            finalEndDate.setDate(finalEndDate.getDate() + 7);
            startDateList.push(new Date(finalStartDate.valueOf()));
            endDateList.push(new Date(finalEndDate.valueOf()));
        }

        startDateList.pop();
        endDateList.pop();

        console.log(startDateList);
        console.log(endDateList);

        const isTimeLineConflict = await this.isTimeLineConflict(
            startDateList,
            endDateList,
            createRegularDto.teacherID,
        );

        createRegularDto.endDate = endDateList[endDateList.length - 1];

        console.log(createRegularDto);
        var reservationList: Reservation[] = [];

        for (var i = 0; i < startDateList.length; i++) {
            var reservationInstance = new Reservation();
            reservationInstance.teacherID = createRegularDto.teacherID;
            reservationInstance.branchName = createRegularDto.branchName;
            reservationInstance.startDate = startDateList[i];
            reservationInstance.endDate = endDateList[i];
            reservationInstance.userID = createRegularDto.userID;
            reservationList.push(reservationInstance);
        }

        const regularID: number = await this.regularScheduleService.postRegularService(
            createRegularDto,
            termID,
        );
        for (var i = 0; i < reservationList.length; i++) reservationList[i].regularID = regularID;
        const reservationInsertRes = await this.reservationRepository.insert(reservationList);
        return reservationInsertRes;
    }

    async closeEndDateAndRemoveReservation(
        // endDate가 미래일경우..
        id: number,
        updateEndRegularDto: UpdateEndRegularDto,
    ): Promise<DeleteResult> {
        const updateRes = await this.regularScheduleService.closeScheduleWithEndDate(
            id,
            updateEndRegularDto.endDate,
        );
        const deleteRes = await this.reservationRepository.delete({
            regularID: id,
            startDate: MoreThan(updateEndRegularDto.endDate),
        });
        return deleteRes;
    }

    async extendToNextTerm(
        condition: FindConditions<RegularSchedule>,
        checkConflict: Boolean,
        from?: number,
    ): Promise<InsertResult> {
        const termList = await this.termService.getNextTerm();
        var curTerm: Term;
        var nextTerm: Term;
        curTerm = termList[0];
        nextTerm = termList[1];
        if (from) {
            curTerm = await this.termService.getTermById(from);
            nextTerm = await this.termService.getTermById(from + 1);
        }
        condition.termID = curTerm.id;
        const regularList = await this.regularScheduleService.getExtendCandidates(condition); //regular schedule list that needed to be extended. not updated yet.
        nextTerm.termStart.setUTCHours(0, 0, 0, 0); //텀아이디가 현재텀인 수업들을 다음텀의 시작부터 끝까지 예약 잡고 레귤러의 엔드데이트를 다음텀 종료일로, 텀아이디를 다음텀 아이디로 업데이트
        var termStart = new Date(nextTerm.termStart.valueOf());
        let dowToStartDateMap = new Map();

        while (dowToStartDateMap.size < 7) {
            dowToStartDateMap.set(termStart.getDay(), new Date(termStart.valueOf()));
            termStart.setDate(termStart.getDate() + 1);
        }
        var reservationList: Reservation[] = [];
        for (var i = 0; i < regularList.length; i++) {
            var firstStartDate = new Date(dowToStartDateMap.get(regularList[i].dow).valueOf());
            var copyStartDate = new Date(regularList[i].startDate.valueOf());
            copyStartDate.setUTCHours(0, 0, 0, 0);
            if (firstStartDate < copyStartDate) {
                firstStartDate = regularList[i].startDate;
            }
            var rsrvListPerRegular = await this.regularToReservationList(
                regularList[i],
                firstStartDate,
                nextTerm.termEnd,
                checkConflict,
            );

            reservationList = reservationList.concat(rsrvListPerRegular);
        }

        const insertRes = await this.reservationRepository.insert(reservationList);
        const updateRes = await this.regularScheduleService.extendToNextTerm(condition, nextTerm);
        return insertRes;
    }

    private async regularToReservationList(
        regular: RegularSchedule,
        firstStartDate: Date,
        termEnd: Date,
        checkConflict: Boolean,
    ): Promise<Reservation[]> {
        var rsrvStartDateTime = new Date(
            `${firstStartDate.getFullYear()}-${
                firstStartDate.getMonth() + 1
            }-${firstStartDate.getDate()} ${regular.startTime}`,
        );
        var rsrvEndDateTime = new Date(
            `${firstStartDate.getFullYear()}-${
                firstStartDate.getMonth() + 1
            }-${firstStartDate.getDate()} ${regular.endTime}`,
        );

        var reservationList: Reservation[] = [];
        var startDateList: Date[] = [];
        var endDateList: Date[] = [];

        while (rsrvEndDateTime <= termEnd) {
            var reservationInstance = new Reservation();
            reservationInstance.teacherID = regular.teacherID;
            reservationInstance.branchName = regular.branchName;
            reservationInstance.startDate = new Date(rsrvStartDateTime.valueOf());
            reservationInstance.endDate = new Date(rsrvEndDateTime.valueOf());
            reservationInstance.userID = regular.userID;
            reservationInstance.regularID = regular.id;
            reservationList.push(reservationInstance);

            rsrvStartDateTime.setDate(rsrvStartDateTime.getDate() + 7);
            rsrvEndDateTime.setDate(rsrvEndDateTime.getDate() + 7);
            startDateList.push(new Date(reservationInstance.startDate.valueOf()));
            endDateList.push(new Date(reservationInstance.endDate.valueOf()));
        }

        if (checkConflict) {
            const isTimeLineConflict = await this.isTimeLineConflict(
                startDateList,
                endDateList,
                regular.teacherID,
            );
        }

        return reservationList;
    }

    async updateTermAndClearReservation(
        id: number,
        createTermDto: CreateTermDto,
    ): Promise<DeleteResult> {
        const curAndFutureTerm = await this.termService.getNextTerm();
        if (curAndFutureTerm[1].id != id)
            throw new BadRequestException('only next term can be updated');

        const [deleteReservation, updateTerm, updateRegular] = await Promise.all([
            this.reservationRepository.delete({
                startDate: MoreThanOrEqual(curAndFutureTerm[1].termStart),
                endDate: LessThanOrEqual(curAndFutureTerm[1].termEnd),
            }),
            this.termService.updateTerm(id, createTermDto),
            this.regularScheduleService.updateTermFromTo(id, curAndFutureTerm[0].id),
        ]).catch((e) => {
            throw e;
        });

        return deleteReservation;
    }
}
