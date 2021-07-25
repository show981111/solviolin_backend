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
    Get,
    Query,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiMethodNotAllowedResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiPreconditionFailedResponse,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
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
import { ReservationQueryDto } from './dto/reservation-query.dto';
import { UpdateEndRegularDto } from './dto/update-end-regular.dto';
import { CheckCancelBefore4h } from './pipes/check-cancel-before4h.pipe';
import { IdToEntityTransform } from './pipes/extend-to-create.pipe';
import { ValidateReservationTime } from './pipes/validate-reservation-time.pipe';
import { RegularReservationService } from './services/regular-reservation.service';
import { ReservationService } from './services/reservation.service';

@Controller('reservation')
@UseFilters(TypeOrmExceptionFilter)
@ApiTags('Reservation API')
export class ReservationController {
    constructor(
        private readonly reservationService: ReservationService,
        private readonly regularReservationService: RegularReservationService,
    ) {}
    /**
     * 1. 취소 : 1.이번달 취소한 수업 < 유저 크레딧
     * 2. 보강 잡기 : 1.해당 시간대 수업가능한지 체크(선생시간대와 비교) 2.다른수업과 안겹치나 3.취소한 수업 있나
     * 3. 연장
     *
     */
    @Patch('/user/cancel/:id')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(UpdateResultChecker)
    @ApiBearerAuth()
    @ApiOperation({
        summary: '유저가 수업 취소 : 이번달 취소한 수업 < 유저크레딧 이여야 가능',
    })
    @ApiParam({ name: 'id', type: 'string', description: 'reservation id to cancel' })
    @ApiOkResponse()
    @ApiUnauthorizedResponse()
    @ApiForbiddenResponse({ description: "cannot cancel other users' course" })
    @ApiMethodNotAllowedResponse({ description: 'exceeds maximum number of cancellation' })
    @ApiNotFoundResponse({ description: 'course not found' })
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
    @ApiBearerAuth()
    @ApiOperation({
        summary: '관리자가 수업 취소(유저가 취소한 것으로 카운트 되지 않는다)',
    })
    @ApiParam({ name: 'id', type: 'string', description: 'reservation id to cancel' })
    @ApiUnauthorizedResponse()
    cancelByAdmin(@Param('id') id: number): Promise<UpdateResult> {
        return this.reservationService.cancelCourseByAdmin(id);
    }

    @Post('/user')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiBody({ description: 'user reserves a makeUp course', type: CreateReservationDto })
    @ApiOperation({
        summary: '유저가 보강 예약',
        description:
            '1.해당 시간대 수업가능한지 체크(선생시간대와 비교) 2.다른수업과 안겹치나 3.취소한 수업 있나',
    })
    @ApiPreconditionFailedResponse({ description: 'time slot is closed' })
    @ApiConflictResponse({ description: 'timeslot is conflicted with other course' })
    @ApiUnauthorizedResponse()
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
    @ApiBearerAuth()
    @ApiParam({
        name: 'count',
        type: 'number',
        description: '0 or 1 : 잡힌 보강이 카운트에 들어가냐 안들어가냐',
    })
    @ApiBody({ description: 'user reserves a makeUp course', type: CreateReservationDto })
    @ApiCreatedResponse()
    @ApiConflictResponse({ description: 'timeslot is conflicted with other course' })
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
    @ApiBearerAuth()
    @ApiParam({ name: 'id', type: 'string', description: 'id to extend' })
    @ApiOperation({
        summary: '유저가 수업 연장(15분)',
        description: '1.해당 시간대 수업 가능한지 2.취소한 수업이 있어서 연장 가능한지 체크',
    })
    @ApiConflictResponse({ description: 'timeslot is conflicted with other course' })
    @ApiForbiddenResponse({ description: "cannot extend other users' course" })
    @ApiNotFoundResponse({ description: 'course not found' })
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
    @ApiBearerAuth()
    @ApiOperation({
        summary: '관리자가 수업 연장(15분)',
    })
    @ApiParam({
        name: 'count',
        type: 'number',
        description: '0 or 1 : 예약이 카운트에 들어가냐 안들어가냐',
    })
    @ApiParam({ name: 'id', type: 'string', description: 'id to extend' })
    @ApiOkResponse()
    @ApiConflictResponse({ description: 'timeslot is conflicted with other course' })
    @ApiNotFoundResponse({ description: 'course not found' })
    extendCourseByAdmin(
        @Param('id', IdToEntityTransform) courseInfo: Reservation,
        @Param('count') count: number,
    ): Promise<UpdateResult> {
        return this.reservationService.extendCourseByAdmin(courseInfo, count);
    }

    @Post('/search')
    @ApiOkResponse({ type: [Reservation] })
    @ApiOperation({
        summary: '예약된 수업 조회(쿼리 조건 만족하는)',
    })
    searchCourses(@Body() query: ReservationQueryDto): Promise<Reservation[]> {
        return this.reservationService.getReservationByQuery(query);
    }

    /**
     * 정기예약
     * 1. 정기예약 잡고 해당 텀에 예약 만듬
     * 2. 정기예약 엔드데이트 설정 그이후 다 삭제
     * 3. 정기예약 다음텀까지 연장
     */
    @Post('/regular')
    @UseGuards(JwtAdminGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: '정기예약 등록',
        description: '레귤러에 등록하고 현재 텀에 예약 등록',
    })
    @ApiConflictResponse({ description: 'timeslot is conflicted with other courses' })
    postRegularSchedule(@Body() createRegularDto: CreateRegularDto): Promise<InsertResult> {
        return this.regularReservationService.registerRegularAndReservation(createRegularDto);
    }

    @Patch('/regular/:id')
    @UseGuards(JwtAdminGuard)
    @UseInterceptors(DeleteResultChecker)
    @ApiBearerAuth()
    @ApiOperation({
        summary: '정기예약 종료 날짜를 업데이트하고 그 이후 수업은 다 삭제한다.',
    })
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
    @ApiBearerAuth()
    @ApiOperation({
        summary: '해당지점의 모든 수업을 다음학기로 연장한다',
        description: '레귤러스케쥴에 termID가 NULL 인것을 제외한 모든 수업이 연장된다.',
    })
    @ApiConflictResponse({ description: 'timeslot is conflicted with other courses' })
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
    @ApiBearerAuth()
    @ApiOperation({
        summary: '해당지점의 모든 수업을 다음학기로 연장한다',
        description: '레귤러스케쥴에 termID가 NULL 인것을 제외한 모든 수업이 연장된다',
    })
    @ApiConflictResponse({ description: 'timeslot is conflicted with other courses' })
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
    @ApiBearerAuth()
    @ApiOperation({
        summary: '학기를 수정한다',
        description:
            '학기를 잘못입력할 경우 학기를 수정한다. 기존의 학기에 있던 수업들은 삭제된다. 이거 하고나서 다음학기로 연장하면 됨.',
    })
    updateTermAndClearReservation(@Param('id') id: number, @Body() createTermDto: CreateTermDto) {
        createTermDto.termStart.setHours(0, 0, 0, 0);
        createTermDto.termEnd.setHours(23, 55, 0, 0);
        return this.regularReservationService.updateTermAndClearReservation(id, createTermDto);
    }
}
