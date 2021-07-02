import {
    Controller,
    Param,
    Patch,
    Post,
    UseFilters,
    Request,
    Body,
    UseGuards,
    UseInterceptors,
    UsePipes,
    ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-access.guard';
import { JwtAdminGuard } from 'src/auth/guards/jwt-admin.guard';
import { Reservation } from 'src/entities/reservation.entity';
import { CreateRegularDto } from 'src/regular-schedule/dto/create-regular.dto';
import { CreateTermDto } from 'src/term/dto/create-term.dto';
import { TypeOrmExceptionFilter } from 'src/utils/filters/typeOrmException.filter';
import { DeleteResultChecker } from 'src/utils/interceptors/deleteResultChecker.interceptor';
import { UpdateResultChecker } from 'src/utils/interceptors/updateResultChecker.interceptor';
import { DeleteResult, InsertResult, UpdateResult } from 'typeorm';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateEndRegularDto } from './dto/update-end-regular.dto';
import { CheckCancelBefore4h } from './pipes/check-cancel-before4h.pipe';
import { IdToEntityTransform } from './pipes/extend-to-create.pipe';
import { ValidateReservationTime } from './pipes/validate-reservation-time.pipe';
import { RegularReservationService } from './services/regular-reservation.service';
import { ReservationService } from './services/reservation.service';

@Controller('reservation')
@UseFilters(new TypeOrmExceptionFilter())
export class ReservationController {
    constructor(
        private readonly reservationService: ReservationService,
        private readonly regularReservationService: RegularReservationService,
    ) {}
    /**
     * 1. 취소 : 1.이번달 취소한 수업 < 유저 크레딧
     * 2. 보강 잡기 : 1.해당 시간대 수업가능한지 체크(선생시간대와 비교) 2.다른수업과 안겹치나 3.취소한 수업 있나
     * 3. 연장
     * 4. 예약가능 시간 보여주기
     */
    @Patch('/user/cancel/:id')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(UpdateResultChecker)
    cancelByUser(
        @Request() req,
        @Param('id', CheckCancelBefore4h) courseInfo: Reservation,
    ): Promise<UpdateResult> {
        if (courseInfo.userID !== req?.user?.userID)
            throw new ForbiddenException("cannot cancel other users' course");
        return this.reservationService.cancelCourseByUser(
            courseInfo.id,
            req?.user?.userID,
            courseInfo.startDate,
        );
    }

    @Patch('/admin/cancel/:id')
    @UseGuards(JwtAdminGuard)
    @UseInterceptors(UpdateResultChecker)
    cancelByAdmin(@Param('id') id: number): Promise<UpdateResult> {
        return this.reservationService.cancelCourseByAdmin(id);
    }

    @Post('/user')
    @UseGuards(JwtAuthGuard)
    reserveMakeUpCourseByUser(
        @Body(ValidateReservationTime) createReservationDto: CreateReservationDto,
        @Request() req,
    ): Promise<InsertResult> {
        return this.reservationService.reserveMakeUpCourseByUser(
            createReservationDto,
            req?.user?.userID,
        );
    }

    @Post('/admin/:count')
    @UseGuards(JwtAdminGuard)
    reserveMakeUpCourseByAdmin(
        @Body() createReservationDto: CreateReservationDto,
        @Param('count') count: number,
    ): Promise<InsertResult> {
        return this.reservationService.reserveMakeUpCourseByAdmin(createReservationDto, count);
    }

    @Patch('/user/extend/:id')
    @UseGuards(JwtAuthGuard)
    @UsePipes(IdToEntityTransform, ValidateReservationTime)
    @UseInterceptors(UpdateResultChecker)
    extendCourseByUser(
        @Param('id') courseInfo: Reservation,
        @Request() req,
    ): Promise<UpdateResult> {
        if (courseInfo.userID !== req?.user?.userID)
            throw new ForbiddenException("cannot extend other users' course");
        return this.reservationService.extendCourseByUser(courseInfo, req?.user?.userID);
    }

    @Patch('/admin/extend/:id/:count')
    @UseGuards(JwtAdminGuard)
    @UseInterceptors(UpdateResultChecker)
    extendCourseByAdmin(
        @Param('id', IdToEntityTransform) courseInfo: Reservation,
        @Param('count') count: number,
    ): Promise<UpdateResult> {
        return this.reservationService.extendCourseByAdmin(courseInfo, count);
    }

    /**
     * 정기예약
     * 1. 정기예약 잡고 해당 텀에 예약 만듬
     * 2. 정기예약 엔드데이트 설정 그이후 다 삭제
     * 3. 정기예약 다음텀까지 연장
     */
    @Post('/regular')
    @UseGuards(JwtAdminGuard)
    postRegularSchedule(@Body() createRegularDto: CreateRegularDto): Promise<InsertResult> {
        return this.regularReservationService.registerRegularAndReservation(createRegularDto);
    }

    @Patch('/regular/:id')
    @UseGuards(JwtAdminGuard)
    @UseInterceptors(DeleteResultChecker)
    closeRegularSchedule(
        @Param('id') id: number,
        @Body() updateEndRegularDto: UpdateEndRegularDto,
    ): Promise<DeleteResult> {
        return this.regularReservationService.closeEndDateAndRemoveReservation(
            id,
            updateEndRegularDto,
        );
    }

    @Post('/regular/extend/:branch')
    @UseGuards(JwtAdminGuard)
    extendRegularSchedule(@Param('branch') branchName: string): Promise<InsertResult> {
        return this.regularReservationService.extendToNextTerm(
            {
                branchName: branchName,
            },
            false,
        );
    }

    @Post('/regular/extend/user/:userID')
    @UseGuards(JwtAdminGuard)
    extendRegularScheduleByUser(@Param('userID') userID: string): Promise<DeleteResult> {
        return this.regularReservationService.extendToNextTerm(
            {
                userID: userID,
            },
            true,
        );
    }

    /**
     * 텀 업데이트
     * 1. 기존 텀아이디로 된 얘들 다 커렌트 텀으로 바꿈
     * 2. 해당 텀에 있는 예약 다 삭제
     * 3. 텀 업데이트
     */

    @Patch('/term/:id')
    @UseGuards(JwtAdminGuard)
    updateTermAndClearReservation(@Param('id') id: number, @Body() createTermDto: CreateTermDto) {
        createTermDto.termStart.setHours(0, 0, 0, 0);
        createTermDto.termEnd.setHours(23, 55, 0, 0);
        return this.regularReservationService.updateTermAndClearReservation(id, createTermDto);
    }
}
