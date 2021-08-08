import {
    Controller,
    Post,
    UseFilters,
    Body,
    Delete,
    Get,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { JwtAdminGuard } from 'src/auth/guards/jwt-admin.guard';
import { TypeOrmExceptionFilter } from 'src/utils/filters/typeOrmException.filter';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { TeacherBranchDto } from '../utils/Teacher-Branch.dto';
import { TeacherService } from './teacher.service';
import {
    ApiBearerAuth,
    ApiBody,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Teacher } from 'src/entities/teacher.entity';
import { BranchDowSearchDto } from './dto/branch-dow-search.dto';

@Controller('teacher')
@UseFilters(TypeOrmExceptionFilter)
@ApiTags('Teacher API')
export class TeacherController {
    constructor(private teacherService: TeacherService) {}
    /**
     * delete conflicts data and insert new data
     * @param teacherData
     * @returns
     */
    @Post()
    @UseGuards(JwtAdminGuard)
    @ApiBearerAuth()
    @ApiBody({ type: CreateTeacherDto })
    @ApiCreatedResponse()
    @ApiUnauthorizedResponse()
    @ApiOperation({ summary: '선생님 스케쥴 등록' })
    create(@Body() teacherData: CreateTeacherDto) {
        return this.teacherService.create(teacherData);
    }

    @Delete('/:id')
    @UseGuards(JwtAdminGuard)
    @ApiBearerAuth()
    @ApiParam({ name: 'id', description: 'id to delete' })
    @ApiOkResponse()
    @ApiUnauthorizedResponse()
    @ApiOperation({ summary: '선생님 스케쥴 삭제' })
    removeById(@Param('id') id: number) {
        return this.teacherService.removeById(id);
    }

    @Delete()
    @UseGuards(JwtAdminGuard)
    @ApiBearerAuth()
    @ApiQuery({
        type: TeacherBranchDto,
    })
    @ApiOkResponse()
    @ApiUnauthorizedResponse()
    @ApiOperation({ summary: '선생님 스케쥴 삭제(쿼리 사용)' })
    removeByQuery(@Query() queryTeacherDto: TeacherBranchDto) {
        return this.teacherService.removeByQuery(queryTeacherDto.getQuery);
    }

    @Get('/search') //teacherID or Branch
    @ApiQuery({ description: 'search option', type: TeacherBranchDto })
    @ApiOkResponse({ type: [Teacher] })
    @ApiOperation({ summary: '선생님 스케쥴 검색' })
    serachTeacher(@Query() queryTeacherDto: TeacherBranchDto): Promise<Teacher[]> {
        return this.teacherService.search(queryTeacherDto.getQuery);
    }

    @Get('/search/name') //teacherID or Branch
    @ApiQuery({ description: 'search option', type: TeacherBranchDto })
    @ApiOkResponse({ type: [Teacher] })
    @ApiOperation({ summary: '선생님 이름 리스트 검색' })
    searchTeacherName(@Query() branchDowSearchDto: BranchDowSearchDto): Promise<Teacher[]> {
        return this.teacherService.getNameList(branchDowSearchDto);
    }
}
