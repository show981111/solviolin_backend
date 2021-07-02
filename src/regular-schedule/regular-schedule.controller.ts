import { Controller, UseGuards, Delete, Param, UseFilters } from '@nestjs/common';
import { JwtAdminGuard } from 'src/auth/guards/jwt-admin.guard';
import { TypeOrmExceptionFilter } from 'src/utils/filters/typeOrmException.filter';
import { RegularScheduleService } from './regular-schedule.service';

@Controller('regular-schedule')
@UseFilters(TypeOrmExceptionFilter)
export class RegularScheduleController {
    constructor(private readonly regularScheduleService: RegularScheduleService) {}
    @Delete('/:id')
    @UseGuards(JwtAdminGuard)
    deleteRegularSchedule(@Param('id') id: number) {
        return this.regularScheduleService.deleteRegular(id);
    }
}
