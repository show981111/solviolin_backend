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
import { TeacherBranchDto } from 'src/utils/Teacher-Branch.dto';
import { TypeOrmExceptionFilter } from 'src/utils/filters/typeOrmException.filter';
import { CreateControlDto } from 'src/control/dto/create-control.dto';
import { ControlService } from './control.service';
import { JwtAdminGuard } from 'src/auth/guards/jwt-admin.guard';
import {
    ApiBearerAuth,
    ApiBody,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Control } from 'src/entities/control.entity';

@Controller('control')
@UseFilters(new TypeOrmExceptionFilter())
@ApiTags('Control API')
export class ControlController {
    constructor(private readonly controlService: ControlService) {}
    @Get()
    @ApiQuery({ type: TeacherBranchDto })
    @ApiResponse({ type: [Control] })
    getControl(@Query() query: TeacherBranchDto): Promise<Control[]> {
        return this.controlService.getControlByQuery(query.getQuery);
    }

    @Post()
    @UseGuards(JwtAdminGuard)
    @ApiBearerAuth()
    @ApiUnauthorizedResponse()
    @ApiOperation({ summary: '컨트롤 등록' })
    createControl(@Body() createControlDto: CreateControlDto) {
        return this.controlService.createControl(createControlDto);
    }

    @Delete('/:id')
    @UseGuards(JwtAdminGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '컨트롤 삭제' })
    @ApiUnauthorizedResponse()
    deleteControl(@Param('id') id: number) {
        return this.controlService.deleteControl(id);
    }

    @Put('/:id')
    @UseGuards(JwtAdminGuard)
    @ApiBearerAuth()
    @ApiParam({ name: 'id', description: 'id to update' })
    @ApiUnauthorizedResponse()
    @ApiOperation({ summary: '컨트롤 수정' })
    updateControl(@Param('id') id: number, @Body() updateControlDto: CreateControlDto) {
        return this.controlService.updateControl(id, updateControlDto);
    }
}
