import {
    Controller,
    Param,
    Patch,
    Post,
    UseFilters,
    Body,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiConflictResponse,
    ApiNotFoundResponse,
    ApiOperation,
    ApiPreconditionFailedResponse,
    ApiTags,
} from '@nestjs/swagger';
import { JwtAdminGuard } from 'src/auth/guards/jwt-admin.guard';
import { CreateRegularDto } from 'src/regular-schedule/dto/create-regular.dto';
import { CreateTermDto } from 'src/term/dto/create-term.dto';
import { TypeOrmExceptionFilter } from 'src/utils/filters/typeOrmException.filter';
import { DeleteResultChecker } from 'src/utils/interceptors/deleteResultChecker.interceptor';
import { DeleteResult, InsertResult, UpdateResult } from 'typeorm';
import { UpdateEndRegularDto } from './dto/update-end-regular.dto';
import { RegularReservationService } from './services/regular-reservation.service';

@Controller('reservation')
@UseFilters(TypeOrmExceptionFilter)
@ApiTags('Reservation API')
export class RegularReservationController {
    constructor(private readonly regularReservationService: RegularReservationService) {}

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
    @ApiPreconditionFailedResponse({ description: 'teacher is not working at the time' })
    postRegularSchedule(@Body() createRegularDto: CreateRegularDto): Promise<InsertResult> {
        return this.regularReservationService.registerRegularAndReservation(createRegularDto);
    }

    @Patch('/regular/:id')
    @UseGuards(JwtAdminGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: '정기예약 종료 날짜를 업데이트하고 그 이후 수업은 다 삭제한다.',
    })
    @ApiNotFoundResponse({ description: 'regular schedule not found' })
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
    @ApiNotFoundResponse({ description: 'next term is not registered' })
    extendRegularSchedule(
        @Param('branch') branchName: string,
    ): Promise<(InsertResult | UpdateResult)[]> {
        return this.regularReservationService.extendToNextTerm(
            {
                branchName: branchName,
            },
            false,
        );
    }

    @Post('/regular/extend/term/:branch/:from')
    @UseGuards(JwtAdminGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: '해당지점의 모든 수업을 다음학기로 연장한다',
        description: '레귤러스케쥴에 termID가 NULL 인것을 제외한 모든 수업이 연장된다.',
    })
    @ApiConflictResponse({ description: 'timeslot is conflicted with other courses' })
    @ApiNotFoundResponse({ description: 'next term is not registered' })
    extendRegularFromTermID(
        @Param('branch') branchName: string,
        @Param('from') from: number,
    ): Promise<(InsertResult | UpdateResult)[]> {
        return this.regularReservationService.extendToNextTerm(
            {
                branchName: branchName,
            },
            false,
            from,
        );
    }

    @Post('/regular/extend/user/:userID')
    @UseGuards(JwtAdminGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: '해당지점의 현재 학기 수업을 다음학기로 연장한다',
        description: '레귤러스케쥴에 termID가 NULL 인것을 제외한 모든 수업이 연장된다',
    })
    @ApiConflictResponse({ description: 'timeslot is conflicted with other courses' })
    extendRegularScheduleByUser(
        @Param('userID') userID: string,
    ): Promise<(InsertResult | UpdateResult)[]> {
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
    @ApiBadRequestResponse({ description: 'only next term can be updated' })
    updateTermAndClearReservation(@Param('id') id: number, @Body() createTermDto: CreateTermDto) {
        createTermDto.termStart.setHours(0, 0, 0, 0);
        createTermDto.termEnd.setHours(23, 55, 0, 0);
        return this.regularReservationService.updateTermAndClearReservation(id, createTermDto);
    }
}
