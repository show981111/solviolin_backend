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
    Req,
    BadRequestException,
    Get,
    Query,
    Delete,
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
import { Link } from 'src/entities/link.entity';
import { Reservation } from 'src/entities/reservation.entity';
import { TypeOrmExceptionFilter } from 'src/utils/filters/typeOrmException.filter';
import { UpdateResultChecker } from 'src/utils/interceptors/updateResultChecker.interceptor';
import { DeleteResult, InsertResult, UpdateResult } from 'typeorm';
import { AvailableSpotFilterDto } from './dto/available-spot-filter.dto';
import { CalculateIncomeDto } from './dto/calculate-income.dto';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { GetChangeListDto } from './dto/get-change-list.dto';
import { ReservationFilterDto } from './dto/reservation-filter.dto';
import { Income } from './interfaces/income.interface';
import { CheckCancelBefore4h } from './pipes/check-cancel-before4h.pipe';
import { IdToEntityTransform } from './pipes/extend-to-create.pipe';
import { ValidateReservationTime } from './pipes/validate-reservation-time.pipe';
import { ReservationService } from './services/reservation.service';

@Controller('reservation')
@UseFilters(TypeOrmExceptionFilter)
@ApiTags('Reservation API')
export class ReservationController {
    constructor(private readonly reservationService: ReservationService) {}
    /**
     * 1. 취소 : 1.이번달 취소한 수업 < 유저 크레딧
     * 2. 보강 잡기 : 1.해당 시간대 수업가능한지 체크(선생시간대와 비교) 2.다른수업과 안겹치나 3.취소한 수업 있나
     * 3. 연장
     * 4. 해당 지점, 선생님, 해당 날짜에 가능한 스팟 show
     */
    @Patch('/user/cancel/:id')
    @UseGuards(JwtAuthGuard)
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
    @ApiCreatedResponse({ type: [InsertResult], description: '생성.' })
    @ApiPreconditionFailedResponse({ description: 'time slot is closed' })
    @ApiConflictResponse({ description: 'timeslot is conflicted with other course' })
    @ApiUnauthorizedResponse()
    reserveMakeUpCourseByUser(
        @Body(ValidateReservationTime) createReservationDto: CreateReservationDto,
        //예약 시작 4시간 전인지, 해당 시간이 선생한테 오픈되있고 클로즈가 아닌지, 혹은 오픈인지 체크
        @Request() req,
    ): Promise<(InsertResult | UpdateResult[])[]> {
        return this.reservationService.reserveMakeUpCourseFromCanceled(
            createReservationDto,
            req?.user?.userID,
            false,
        );
    }

    @Post('/admin')
    @UseGuards(JwtAdminGuard)
    @ApiBearerAuth()
    @ApiBody({ description: 'admin reserves a makeUp course', type: CreateReservationDto })
    @ApiOperation({
        summary: '관리자가 보강 예약',
        description: '1.다른수업과 안겹치나 2.취소한 수업 있나',
    })
    @ApiCreatedResponse({ type: [InsertResult], description: '생성.' })
    @ApiPreconditionFailedResponse({ description: 'time slot is closed' })
    @ApiConflictResponse({ description: 'timeslot is conflicted with other course' })
    @ApiUnauthorizedResponse()
    reserveMakeUpCourseByAdmin(
        @Body() createReservationDto: CreateReservationDto,
        @Request() req,
    ): Promise<(InsertResult | UpdateResult[])[]> {
        return this.reservationService.reserveMakeUpCourseFromCanceled(
            createReservationDto,
            req?.user?.userID,
            true,
        );
    }

    @Post('/free')
    @UseGuards(JwtAdminGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: '관리자가 free course 예약',
        description: '1.다른수업과 안겹치나 ',
    })
    @ApiCreatedResponse({ type: [InsertResult], description: '생성.' })
    @ApiConflictResponse({ description: 'timeslot is conflicted with other course' })
    reserveFreeCourseByAdmin(
        @Body() createReservationDto: CreateReservationDto,
    ): Promise<InsertResult> {
        return this.reservationService.reserveNewClassByAdmin(createReservationDto);
    }

    @Patch('/user/extend/:id')
    @UseGuards(JwtAuthGuard)
    @UsePipes(IdToEntityTransform, ValidateReservationTime)
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
    ): Promise<(UpdateResult | InsertResult | UpdateResult[])[]> {
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
    searchCourses(@Body() filter: ReservationFilterDto): Promise<Reservation[]> {
        return this.reservationService.getReservationByFilter(filter);
    }

    @Post('/available') //1. 선생 시간표 받아서 2. open 열고 3. close 닫고 4. 수업있는곳 닫고
    @ApiOkResponse({ type: [Date] })
    @ApiOperation({
        summary: '현재 오픈되어 있는 스팟 제공',
    })
    getAvailableSpot(@Body() filter: AvailableSpotFilterDto): Promise<Date[]> {
        return this.reservationService.getAvailableSpotByFilter(filter);
    }

    @Post('/changes')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary:
            '유저가 변경한 내역을 가져온다(관리자가 잡아준 보강이나 관리자가 잡아준 연장은 여기에 안뜸',
    })
    @ApiOkResponse({
        type: [Link],
        description: 'Link에 추가적으로 from의 Reservation정보, to의 Reservation 정보',
    })
    getChangeListByUser(@Body() getChangeListDto: GetChangeListDto, @Req() req): Promise<Link[]> {
        return this.reservationService.getChangeList(req?.user?.userID, getChangeListDto.range);
    }

    @Post('/changes/:userID')
    @UseGuards(JwtAdminGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary:
            '유저가 변경한 내역을 가져온다(관리자가 잡아준 보강이나 관리자가 잡아준 연장은 여기에 안뜸',
        description: 'post body에 userID 필수',
    })
    @ApiOkResponse({
        type: [Link],
        description: 'Link에 추가적으로 from의 Reservation정보, to의 Reservation 정보도 같이줌',
    })
    getChangeListByAdmin(
        @Body() getChangeListDto: GetChangeListDto,
        @Param('userID') userID: string,
    ): Promise<Link[]> {
        console.log(getChangeListDto);
        console.log(userID);
        if (!userID) throw new BadRequestException('userID is empty');
        return this.reservationService.getChangeList(userID, getChangeListDto.range);
    }

    @Get('/test')
    test() {
        return this.reservationService.isMakeUpAvailable('sleep1', 15);
    }

    /**
     * Teacher 관련
     * 1.선생 예약된 수업 계산해서 돈 계산.
     * 2.해당 학기 해당 선생 취소된 수업들 리스트업-> 기존 검색 API 이용. teacherID : 선생이름/bookingStatus = -2 , 2 적으면 된다
     */

    @Post('/salary')
    @UseGuards(JwtAdminGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: '선생님 급여 계산',
    })
    async calculateSalary(
        @Body() calculateIncomeDto: CalculateIncomeDto,
    ): Promise<[string, Income][]> {
        const res = await this.reservationService.calculateSalary(calculateIncomeDto);
        return [...res.entries()];
    }

    @Delete()
    @UseGuards(JwtAdminGuard)
    async deleteReservations(@Body('ids') ids: number[]): Promise<DeleteResult> {
        return this.reservationService.deleteReservation(ids);
    }

    @Get('/canceled/:teacherID')
    @UseGuards(JwtAdminGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: '해당 선생 이름으로 취소된 수업 리스트업',
    })
    @ApiOkResponse({
        type: [Reservation],
    })
    async getCanceledCourseByTeacher(
        @Param('teacherID') teacherID: string,
    ): Promise<Reservation[]> {
        return this.reservationService.getCanceledCourseByTeacher(teacherID);
    }

    // @Post('/migrate/cancel')
    // async migrateCancelled() {
    //     return this.reservationService.migrateCancel();
    // }
}
