import { ApiProperty } from '@nestjs/swagger';
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
    @ApiProperty()
    id: number;

    @Column({ type: 'time', nullable: false })
    @ApiProperty()
    startTime: string;

    @Column({ type: 'time', nullable: false })
    @ApiProperty()
    endTime: string;

    @Column({ type: 'tinyint', nullable: false })
    @ApiProperty()
    dow: number;

    @Column({ type: 'datetime', nullable: false })
    @ApiProperty()
    startDate: Date;

    @Column({ type: 'datetime', nullable: false })
    @ApiProperty()
    endDate: Date;

    /** USER */
    @ManyToOne((type) => User, (User) => User.userID, {
        onDelete: 'NO ACTION',
        onUpdate: 'CASCADE',
    })
    @JoinColumn({ name: 'FK_REGULARSCHEDULE_userID' })
    user: User;

    @Column({ name: 'FK_REGULARSCHEDULE_userID' })
    @ApiProperty()
    userID: string;

    /** TEACHERID */
    @ManyToOne((type) => TeacherID, (TeacherID) => TeacherID.teacherID, {
        onDelete: 'NO ACTION',
        onUpdate: 'CASCADE',
    })
    @JoinColumn({ name: 'FK_REGULARSCHEDULE_teacherID' })
    teacher: TeacherID;

    @Column({ name: 'FK_REGULARSCHEDULE_teacherID' })
    @ApiProperty()
    teacherID: string;

    /** BRANCH */
    @ManyToOne((type) => Branch, (Branch) => Branch.branchName, {
        onDelete: 'NO ACTION',
        onUpdate: 'CASCADE',
    })
    @JoinColumn({ name: 'FK_REGULARSCHEDULE_branch' })
    branch: Branch;

    @Column({ name: 'FK_REGULARSCHEDULE_branch' })
    @ApiProperty()
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
    @ApiProperty()
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
