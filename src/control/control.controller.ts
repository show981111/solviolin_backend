import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query,
    UseFilters,
    UseGuards,
} from '@nestjs/common';
import { QueryTeacherBranchDto } from 'src/utils/query-teacher-branch.dto';
import { TypeOrmExceptionFilter } from 'src/utils/typeOrmException.filter';
import { CreateControlDto } from 'src/control/dto/create-control.dto';
import { ControlService } from './control.service';
import { JwtAdminGuard } from 'src/auth/guards/jwt-admin.guard';

@Controller('control')
@UseFilters(new TypeOrmExceptionFilter())
export class ControlController {
    constructor(private readonly controlService: ControlService) {}
    @Get()
    getControl(@Query() query: QueryTeacherBranchDto) {
        return this.controlService.getControlByQuery(query);
    }
    //close 면 기존 예약된거 다 취소~
    @Post()
    @UseGuards(JwtAdminGuard)
    createControl(@Body() createControlDto: CreateControlDto) {
        return this.controlService.createControl(createControlDto);
    }

    @Delete('/:id')
    @UseGuards(JwtAdminGuard)
    deleteControl(@Param('id') id: number) {
        return this.controlService.deleteControl(id);
    }

    @Put('/:id')
    @UseGuards(JwtAdminGuard)
    updateControl(
        @Param('id') id: number,
        @Body() updateControlDto: CreateControlDto,
    ) {
        return this.controlService.updateControl(id, updateControlDto);
    }
}
