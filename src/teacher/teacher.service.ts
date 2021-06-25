import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Teacher } from 'src/entities/teacher.entity';
import { InsertResult } from 'typeorm';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { QueryTeacherDto } from './dto/query-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { TeacherRepository } from './teacher.repository';

@Injectable()
export class TeacherService {
    constructor(private teacherRepository: TeacherRepository) {}

    async create(createTeacherDto: CreateTeacherDto): Promise<InsertResult> {
        const teacher = new Teacher();
        teacher.setTeacher(createTeacherDto);
        const conflicts = await this.findConflict(teacher);
        if (conflicts.length > 0) await this.removeConflicts(teacher);
        const res = await this.teacherRepository.insert(teacher);
        return res;
    }

    async removeById(id: number): Promise<any> {
        const res = await this.teacherRepository.delete(id);
        if (res.affected < 1) throw new NotFoundException('row not found');
        return res;
    }

    async removeByQuery(query: QueryTeacherDto): Promise<any> {
        var q = query.getQuery;
        if (!q.branch && !q.teacher)
            throw new BadRequestException('should set at least one property');
        const res = await this.teacherRepository.delete(query.getQuery);
        if (res.affected < 1) throw new NotFoundException('row not found');
        return res;
    }

    async search(query: QueryTeacherDto): Promise<any> {
        return await this.teacherRepository.find(query.getQuery);
    }

    async findConflict(teacherInfo: Teacher): Promise<any> {
        const res = await this.teacherRepository
            .createQueryBuilder()
            .where(
                `FK_TEACHER_teacherID = :teacher AND workDow = :workDow AND
            ( (startTime <= :startTime AND endTime >= :startTime ) OR (startTime <= :endTime AND endTime >= :endTime) )`,
                {
                    teacher: teacherInfo.teacher.teacherID,
                    workDow: teacherInfo.workDow,
                    startTime: teacherInfo.startTime,
                    endTime: teacherInfo.endTime,
                },
            )
            .getMany();
        return res;
    }

    async removeConflicts(teacherInfo: Teacher): Promise<any> {
        const conflicts = await this.findConflict(teacherInfo);
        console.log(conflicts);
        var ids = [];
        for (var i = 0; i < conflicts.length; i++) {
            ids.push(conflicts[i].id);
        }
        return await this.teacherRepository.delete(ids);
    }
}
