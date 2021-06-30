import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Teacher } from 'src/entities/teacher.entity';
import { DeleteResult, InsertResult } from 'typeorm';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { TeacherBranchDto } from '../utils/Teacher-Branch.dto';
import { TeacherRepository } from './teacher.repository';
import { TeacherBranchQuery } from 'src/utils/interface/Teacher-Branch-Query.interface';

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

    async removeById(id: number): Promise<DeleteResult> {
        const res = await this.teacherRepository.delete(id);
        if (res.affected < 1) throw new NotFoundException('row not found');
        return res;
    }

    async removeByQuery(query: TeacherBranchQuery): Promise<DeleteResult> {
        if (!query.branch && !query.teacher)
            throw new BadRequestException('should set at least one property');
        const res = await this.teacherRepository.delete(query);
        if (res.affected < 1) throw new NotFoundException('row not found');
        return res;
    }

    async search(query: TeacherBranchQuery): Promise<Teacher[]> {
        return await this.teacherRepository.find(query);
    }

    async getWorkSlot(query: TeacherBranchQuery, startDate: Date, endDate: Date): Promise<Teacher> {
        var day = startDate.getDay();
        var startTime = startDate.toTimeString();
        var endTime = endDate.toTimeString();
        const res = await this.teacherRepository
            .createQueryBuilder()
            .where(
                `FK_TEACHER_teacherID = :teacher AND FK_TEACHER_branch = :branch AND
                 workDow = :workDow AND (startTime <= :startTime AND endTime >= :endTime)`,
                {
                    teacher: query.teacher.teacherID,
                    branch: query.branch.branchName,
                    workDow: day,
                    startTime: startTime,
                    endTime: endTime,
                },
            )
            .getOne();
        return res;
    }

    async findConflict(teacherInfo: Teacher): Promise<Teacher[]> {
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

    async removeConflicts(teacherInfo: Teacher): Promise<DeleteResult> {
        const conflicts = await this.findConflict(teacherInfo);
        console.log(conflicts);
        var ids = [];
        for (var i = 0; i < conflicts.length; i++) {
            ids.push(conflicts[i].id);
        }
        return await this.teacherRepository.delete(ids);
    }

    async getTeacherByBranch(branchName: string): Promise<Teacher[]> {
        return await this.teacherRepository.find({ branchName: branchName });
    }
}
