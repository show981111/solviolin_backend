import {
    Controller,
    UseGuards,
    Delete,
    Param,
    UseFilters,
    Get,
    Request,
    UseInterceptors,
    Post,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-access.guard';
import { JwtAdminGuard } from 'src/auth/guards/jwt-admin.guard';
import { RegularSchedule } from 'src/entities/regularSchedule.entity';
import { TypeOrmExceptionFilter } from 'src/utils/filters/typeOrmException.filter';
import { DeleteResultChecker } from 'src/utils/interceptors/deleteResultChecker.interceptor';
import { DeleteResult } from 'typeorm';
import { RegularScheduleService } from './regular-schedule.service';

@Controller('regular-schedule')
@UseFilters(TypeOrmExceptionFilter)
@ApiTags('Regular Schedule API')
export class RegularScheduleController {
    constructor(private readonly regularScheduleService: RegularScheduleService) {}
    @Delete('/:id')
    @UseGuards(JwtAdminGuard)
    @ApiBearerAuth()
    @UseInterceptors(DeleteResultChecker)
    @ApiOperation({
        summary:
            'delete regular schedule(only future schedule. startDate should be after current date)',
        description: 'delete regular schedule and regarding reservations(through foreign key).',
    })
    @ApiNotFoundResponse()
    deleteRegularSchedule(@Param('id') id: number): Promise<DeleteResult> {
        return this.regularScheduleService.deleteRegular(id);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Get My Regular schedules of today',
    })
    @ApiOkResponse({ type: [RegularSchedule] })
    getMyRegularSchedule(@Request() req): Promise<RegularSchedule[]> {
        return this.regularScheduleService.getRegularSechduleByUser(
            req?.user?.userID,
            new Date(new Date().getTime() + 9 * 60 * 60 * 1000),
        );
    }

    @Get('/:userID')
    @UseGuards(JwtAdminGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: "Get user's Regular schedules of today(for admin)",
    })
    @ApiOkResponse({ type: [RegularSchedule] })
    getRegularSchedule(@Param('userID') userID: string): Promise<RegularSchedule[]> {
        return this.regularScheduleService.getRegularSechduleByUser(
            userID,
            new Date(new Date().getTime() + 9 * 60 * 60 * 1000),
        );
    }

    // @Post('/migrate')
    // migrateRegular() {
    //     console.log('dsa');
    //     return this.regularScheduleService.migrateRegular();
    // }
}
