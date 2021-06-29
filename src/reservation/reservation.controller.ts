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
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-access.guard';
import { JwtAdminGuard } from 'src/auth/guards/jwt-admin.guard';
import { TypeOrmExceptionFilter } from 'src/utils/filters/typeOrmException.filter';
import { UpdateResultChecker } from 'src/utils/interceptors/updateResultChecker.interceptor';
import { CreateReservationDto } from './dto/create-reservation.dto';
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
    cancelByUser(@Request() req, @Param('id') id: number) {
        return this.reservationService.cancelCourseByUser(id, req?.user?.userID);
    }

    @Patch('/admin/cancel/:id')
    @UseGuards(JwtAdminGuard)
    @UseInterceptors(UpdateResultChecker)
    cancelByAdmin(@Param('id') id: number) {
        return this.reservationService.cancelCourseByAdmin(id);
    }

    @Post('/user')
    @UseGuards(JwtAuthGuard)
    reserveMakeUpCourseByUser(@Body() createReservationDto: CreateReservationDto, @Request() req) {
        console.log(createReservationDto);
        return this.reservationService.reserveMakeUpCourseByUser(
            createReservationDto,
            req?.user?.userID,
        );
    }

    @Post('/admin/:count')
    reserveMakeUpCourseByAdmin(
        @Body() createReservationDto: CreateReservationDto,
        @Param('count') count: number,
        @Request() req,
    ) {
        return 'user book a makeup class';
    }

    @Patch('/user/extend/:id')
    extendCourseByUser(@Param('id') id: number) {
        return 'user extend the course';
    }

    @Patch('/admin/extend/:id/:count')
    extendCourseByAdmin(@Param('id') id: number, @Param('count') count: number) {
        return 'user extend the course';
    }
}
