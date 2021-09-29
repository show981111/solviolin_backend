import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Teacher } from 'src/entities/teacher.entity';
import { DeleteResult, getConnection, InsertResult } from 'typeorm';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { TeacherBranchDto } from '../utils/Teacher-Branch.dto';
import { TeacherRepository } from './teacher.repository';
import { TeacherBranchQuery } from 'src/utils/interface/Teacher-Branch-Query.interface';
import { BranchDowSearchDto } from './dto/branch-dow-search.dto';
import * as fs from 'fs';
import { User } from 'src/entities/user.entity';
import { TeacherID } from 'src/entities/teacherID.entity';
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

    async getNameList(query: BranchDowSearchDto): Promise<Teacher[]> {
        return await this.teacherRepository
            .createQueryBuilder()
            .where(query)
            .leftJoin('Teacher.teacher', 'teacher.teacherID')
            .addSelect('teacher.teacherID.color')
            .addSelect('teacher.teacherID.endDate')
            .groupBy('Teacher.teacherID')
            .getMany();
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

    async getWorkSlotAtDate(
        teacherID: string,
        branchName: string,
        dow: number,
    ): Promise<Teacher[]> {
        return await this.teacherRepository.find({
            teacherID: teacherID,
            branchName: branchName,
            workDow: dow,
        });
    }

    async migrateSchedule(file: Express.Multer.File) {
        if (!file) throw new BadRequestException('file is empty');
        var obj = JSON.parse(file.buffer.toString());
        // if (!file) {
        //     obj = JSON.parse(
        //         fs.readFileSync(
        //             '/Users/yongseunglee/solviolin/migration/COURSETIMELINE.json',
        //             'utf8',
        //         ),
        //     );
        // }
        var courseTimeLines = obj[2].data;
        const teacherSchedule: Teacher[] = [];

        const teachers: User[] = await getConnection()
            .createQueryBuilder()
            .select('user')
            .from(User, 'user')
            .where('user.userType = 1')
            .getMany();

        var tmp = [];
        for (var i = 0; i < courseTimeLines.length; i++) {
            if (courseTimeLines[i].courseTeacher) {
                var userExist = 0;
                const teacher: Teacher = new Teacher();
                for (var j = 0; j < teachers.length; j++) {
                    if (courseTimeLines[i].courseTeacher === teachers[j].userName) {
                        teacher.teacherID = teachers[j].userID;
                        userExist = 1;
                        break;
                    }
                }
                if (!userExist) {
                    tmp.push(courseTimeLines[i].courseTeacher);
                    continue;
                }
                teacher.startTime = courseTimeLines[i].startTime;
                teacher.endTime = courseTimeLines[i].endTime;
                teacher.branchName = courseTimeLines[i].courseBranch;
                switch (courseTimeLines[i].courseDay) {
                    case '일': {
                        teacher.workDow = 0;
                        break;
                    }
                    case '월': {
                        teacher.workDow = 1;
                        break;
                    }
                    case '화': {
                        teacher.workDow = 2;
                        break;
                    }
                    case '수': {
                        teacher.workDow = 3;
                        break;
                    }
                    case '목': {
                        teacher.workDow = 4;
                        break;
                    }
                    case '금': {
                        teacher.workDow = 5;
                        break;
                    }
                    case '토': {
                        teacher.workDow = 6;
                        break;
                    }
                }
                teacherSchedule.push(teacher);
            }
        }

        return await this.teacherRepository.insert(teacherSchedule);
    }
}
