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
import { TypeOrmExceptionFilter } from 'src/utils/filters/typeOrmException.filter';
import { UpdateResultChecker } from 'src/utils/interceptors/updateResultChecker.interceptor';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { CheckCancelBefore4h } from './pipes/check-cancel-before4h.pipe';
import { IdToEntityTransform } from './pipes/extend-to-create.pipe';
import { ValidateReservationTime } from './pipes/validate-reservation-time.pipe';
import { ReservationService } from './reservation.service';

@Controller('reservation')
@UseFilters(new TypeOrmExceptionFilter())
export class ReservationController {
    constructor(private readonly reservationService: ReservationService) {}
    /**
     * 1. 취소 : 1.이번달 취소한 수업 < 유저 크레딧
     * 2. 보강 잡기 : 1.해당 시간대 수업가능한지 체크(선생시간대와 비교) 2.다른수업과 안겹치나 3.취소한 수업 있나
     * 3. 연장
     * 4. 예약가능 시간 보여주기
     */
    @Patch('/user/cancel/:id')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(UpdateResultChecker)
    cancelByUser(@Request() req, @Param('id', CheckCancelBefore4h) courseInfo: Reservation) {
        if (courseInfo.userID !== req?.user?.userID)
            throw new ForbiddenException("cannot cancel other users' course");
        return this.reservationService.cancelCourseByUser(courseInfo.id, req?.user?.userID);
    }

    @Patch('/admin/cancel/:id')
    @UseGuards(JwtAdminGuard)
    @UseInterceptors(UpdateResultChecker)
    cancelByAdmin(@Param('id') id: number) {
        return this.reservationService.cancelCourseByAdmin(id);
    }

    @Post('/user')
    @UseGuards(JwtAuthGuard)
    reserveMakeUpCourseByUser(
        @Body(ValidateReservationTime) createReservationDto: CreateReservationDto,
        @Request() req,
    ) {
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
    ) {
        return this.reservationService.reserveMakeUpCourseByAdmin(createReservationDto, count);
    }

    @Patch('/user/extend/:id')
    @UseGuards(JwtAuthGuard)
    @UsePipes(IdToEntityTransform, ValidateReservationTime)
    @UseInterceptors(UpdateResultChecker)
    extendCourseByUser(@Param('id') courseInfo: Reservation, @Request() req) {
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
    ) {
        console.log(courseInfo);
        return this.reservationService.extendCourseByAdmin(courseInfo, count);
    }
}
