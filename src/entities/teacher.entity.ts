import { ApiProperty } from '@nestjs/swagger';
import { Branch } from 'src/entities/branch.entity';
import { CreateTeacherDto } from 'src/teacher/dto/create-teacher.dto';
import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    BaseEntity,
    RelationId,
} from 'typeorm';
import { TeacherID } from './teacherID.entity';

@Entity('TEACHER')
export class Teacher extends BaseEntity {
    @PrimaryGeneratedColumn('increment')
    @ApiProperty()
    id: number;

    @Column({ name: 'FK_TEACHER_teacherID' })
    @RelationId((teacher: Teacher) => teacher.teacher)
    @ApiProperty()
    teacherID: string;

    @ManyToOne((type) => TeacherID, (TeacherID) => TeacherID.teacherID, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn({ name: 'FK_TEACHER_teacherID' })
    teacher: TeacherID;

    @ManyToOne((type) => Branch, (Branch) => Branch.branchName, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn({ name: 'FK_TEACHER_branch' })
    branch: Branch;

    @Column({ name: 'FK_TEACHER_branch' })
    @ApiProperty()
    branchName: string;

    @Column({ type: 'tinyint', nullable: false })
    @ApiProperty()
    workDow: number;

    @Column({ type: 'varchar', nullable: false })
    @ApiProperty()
    startTime: Date;

    @Column({ type: 'varchar', nullable: false })
    @ApiProperty()
    endTime: Date;

    setTeacher(createTeacherDto: CreateTeacherDto): void {
        let br = new Branch(createTeacherDto.teacherBranch);
        let tr = new TeacherID(createTeacherDto.teacherID);
        this.teacher = tr;
        this.branch = br;
        this.workDow = createTeacherDto.workDow;
        this.startTime = createTeacherDto.startTime;
        this.endTime = createTeacherDto.endTime;
    }
}
