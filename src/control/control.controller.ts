import {
    BadRequestException,
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
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Control } from 'src/entities/control.entity';
import { ControlFilterDto } from './dto/search-control.dto';

@Controller('control')
@UseFilters(TypeOrmExceptionFilter)
@ApiTags('Control API')
export class ControlController {
    constructor(private readonly controlService: ControlService) {}
    @Post('/search')
    @ApiQuery({ type: ControlFilterDto })
    @ApiResponse({ type: [Control] })
    @ApiOperation({ summary: '컨트롤 검색' })
    getControl(@Body() filter: ControlFilterDto): Promise<Control[]> {
        return this.controlService.getControlByFilter(filter);
    }

    @Post()
    @UseGuards(JwtAdminGuard)
    @ApiBearerAuth()
    @ApiUnauthorizedResponse()
    @ApiOperation({ summary: '컨트롤 등록' })
    createControl(@Body() createControlDto: CreateControlDto) {
        if (
            createControlDto.status === 1 &&
            createControlDto.cancelInClose !== 0 &&
            createControlDto.cancelInClose !== 1
        ) {
            throw new BadRequestException('Close Control should define cancleInClose(0 or 1)');
        }
        return this.controlService.createControl(createControlDto, createControlDto.cancelInClose);
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
