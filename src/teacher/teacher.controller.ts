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
import { QueryTeacherBranchDto } from '../utils/query-teacher-branch.dto';
import { TeacherService } from './teacher.service';

@Controller('teacher')
@UseFilters(new TypeOrmExceptionFilter())
export class TeacherController {
    constructor(private teacherService: TeacherService) {}
    /**
     * delete conflicts data and insert new data
     * @param teacherData
     * @returns
     */
    @Post()
    @UseGuards(JwtAdminGuard)
    create(@Body() teacherData: CreateTeacherDto) {
        return this.teacherService.create(teacherData);
    }

    @Delete('/:id')
    @UseGuards(JwtAdminGuard)
    removeById(@Param('id') id: number) {
        return this.teacherService.removeById(id);
    }

    @Delete()
    @UseGuards(JwtAdminGuard)
    removeByQuery(@Query() queryTeacherDto: QueryTeacherBranchDto) {
        return this.teacherService.removeByQuery(queryTeacherDto);
        // return `${teacherID} AND ${branch}`;
    }

    @Get('/search') //teacherID or Branch
    serachTeacher(@Query() queryTeacherDto: QueryTeacherBranchDto) {
        return this.teacherService.search(queryTeacherDto);
    }
}
