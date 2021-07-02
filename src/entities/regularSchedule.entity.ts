import { Branch } from 'src/entities/branch.entity';
import { CreateRegularDto } from 'src/regular-schedule/dto/create-regular.dto';
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Reservation } from './reservation.entity';
import { TeacherID } from './teacherID.entity';
import { Term } from './term.entity';
import { User } from './user.entity';

@Entity('REGULARSCHEDULE')
export class RegularSchedule {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ type: 'time', nullable: false })
    startTime: string;

    @Column({ type: 'time', nullable: false })
    endTime: string;

    @Column({ type: 'tinyint', nullable: false })
    dow: number;

    @Column({ type: 'datetime', nullable: false })
    startDate: Date;

    @Column({ type: 'datetime', nullable: false })
    endDate: Date;

    /** USER */
    @ManyToOne((type) => User, (User) => User.userID, {
        onDelete: 'NO ACTION',
        onUpdate: 'CASCADE',
    })
    @JoinColumn({ name: 'FK_REGULARSCHEDULE_userID' })
    user: User;

    @Column({ name: 'FK_REGULARSCHEDULE_userID' })
    userID: string;

    /** TEACHERID */
    @ManyToOne((type) => TeacherID, (TeacherID) => TeacherID.teacherID, {
        onDelete: 'NO ACTION',
        onUpdate: 'CASCADE',
    })
    @JoinColumn({ name: 'FK_REGULARSCHEDULE_teacherID' })
    teacher: TeacherID;

    @Column({ name: 'FK_REGULARSCHEDULE_teacherID' })
    teacherID: string;

    /** BRANCH */
    @ManyToOne((type) => Branch, (Branch) => Branch.branchName, {
        onDelete: 'NO ACTION',
        onUpdate: 'CASCADE',
    })
    @JoinColumn({ name: 'FK_REGULARSCHEDULE_branch' })
    branch: Branch;

    @Column({ name: 'FK_REGULARSCHEDULE_branch' })
    branchName: string;

    /**RESERVATION */
    @OneToMany((type) => Reservation, (Reservation) => Reservation.regular)
    reservations: Reservation[];

    /** TERM */
    @ManyToOne((type) => Term, (Term) => Term.id, {
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
    })
    @JoinColumn({ name: 'FK_REGULARSCHEDULE_termID' })
    term: Term;

    @Column({ name: 'FK_REGULARSCHEDULE_termID' })
    termID: number;

    setRegularSchedule(createRegularDto: CreateRegularDto): void {
        this.startTime = `${createRegularDto.startDate.getHours()}:${createRegularDto.startDate.getMinutes()}`;
        this.endTime = `${createRegularDto.endDate.getHours()}:${createRegularDto.endDate.getMinutes()}`;
        this.dow = createRegularDto.startDate.getDay();
        this.startDate = createRegularDto.startDate;
        this.endDate = createRegularDto.endDate;
        this.userID = createRegularDto.userID;
        this.teacherID = createRegularDto.teacherID;
        this.branchName = createRegularDto.branchName;
    }
}
