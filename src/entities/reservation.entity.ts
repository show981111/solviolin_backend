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

@Entity('RESERVATION')
export class Reservation {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ type: 'datetime', nullable: false })
    startDate: Date;

    @Column({ type: 'datetime', nullable: false })
    endDate: Date;

    @Column({ type: 'tinyint', nullable: false })
    bookingStatus: number;

    @Column({ type: 'int', width: 11, nullable: false, default: 0 })
    extendedMin: number;

    /** USER */
    @ManyToOne((type) => User, (User) => User.userID, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn({ name: 'FK_RESERVATION_userID' })
    user: User;

    @Column({ name: 'FK_RESERVATION_userID' })
    userID: string;

    /** TEACHERID */
    @ManyToOne((type) => TeacherID, (TeacherID) => TeacherID.teacherID, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn({ name: 'FK_RESERVATION_teacherID' })
    teacher: TeacherID;

    @Column({ name: 'FK_RESERVATION_teacherID' })
    teacherID: string;

    /** BRANCH */
    @ManyToOne((type) => Branch, (Branch) => Branch.branchName, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn({ name: 'FK_RESERVATION_branch' })
    branch: Branch;

    @Column({ name: 'FK_RESERVATION_branch' })
    branchName: string;
}
