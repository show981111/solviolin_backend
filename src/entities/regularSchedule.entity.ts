import { Branch } from 'src/entities/branch.entity';
import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { TeacherID } from './teacherID.entity';
import { User } from './user.entity';

@Entity('REGULARSCHEDULE')
export class RegularSchedule {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ type: 'time', nullable: false })
    startTime: Date;

    @Column({ type: 'time', nullable: false })
    endTime: Date;

    @Column({ type: 'tinyint', nullable: false })
    dow: number;

    @Column({ type: 'datetime', nullable: false })
    startDate: Date;

    @Column({ type: 'datetime', nullable: false })
    endDate: Date;

    /** USER */
    @ManyToOne((type) => User, (User) => User.userID, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn({ name: 'FK_REGULARSCHEDULE_userID' })
    user: User;

    @Column({ name: 'FK_REGULARSCHEDULE_userID' })
    userID: string;

    /** TEACHERID */
    @ManyToOne((type) => TeacherID, (TeacherID) => TeacherID.teacherID, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn({ name: 'FK_REGULARSCHEDULE_teacherID' })
    teacher: TeacherID;

    @Column({ name: 'FK_REGULARSCHEDULE_teacherID' })
    teacherID: string;

    /** BRANCH */
    @ManyToOne((type) => Branch, (Branch) => Branch.branchName, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn({ name: 'FK_REGULARSCHEDULE_branch' })
    branch: Branch;

    @Column({ name: 'FK_REGULARSCHEDULE_branch' })
    branchName: string;
}
