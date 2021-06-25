import {
    Controller,
    Post,
    UseFilters,
    Body,
    Delete,
    Get,
    Patch,
    Param,
    Query,
} from '@nestjs/common';
import { TypeOrmExceptionFilter } from 'src/utils/typeOrmException.filter';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { QueryTeacherDto } from './dto/query-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { TeacherService } from './teacher.service';

@Controller('teacher')
@UseFilters(new TypeOrmExceptionFilter())
export class TeacherController {
    constructor(private teacherService: TeacherService) {}
    @Post()
    create(@Body() teacherData: CreateTeacherDto) {
        return this.teacherService.create(teacherData);
    }

    @Delete('/:id')
    removeById(@Param('id') id: number) {
        return this.teacherService.removeById(id);
    }

    @Delete()
    removeByQuery(@Query() queryTeacherDto: QueryTeacherDto) {
        return this.teacherService.removeByQuery(queryTeacherDto);
        // return `${teacherID} AND ${branch}`;
    }

    @Get('/search') //teacherID or Branch
    serachTeacher(@Query() queryTeacherDto: QueryTeacherDto) {
        return this.teacherService.search(queryTeacherDto);
    }
}
