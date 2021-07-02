import { Branch } from 'src/entities/branch.entity';
import { CreateReservationDto } from 'src/reservation/dto/create-reservation.dto';
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { RegularSchedule } from './regularSchedule.entity';
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

    @Column({ type: 'tinyint', nullable: false, default: 0 })
    bookingStatus: number;
    /**
     * 1 : userMakeUpBook 2 : userCancel 3 : userExtend
     * -1 : adminMakeUpBook -2 : adminCancel 3 : adminExtend <= admin is not counted
     */

    @Column({ type: 'int', width: 11, nullable: false, default: 0 })
    extendedMin: number;

    /** USER */
    @ManyToOne((type) => User, (User) => User.userID, {
        onDelete: 'NO ACTION',
        onUpdate: 'CASCADE',
    })
    @JoinColumn({ name: 'FK_RESERVATION_userID' })
    user: User;

    @Column({ name: 'FK_RESERVATION_userID' })
    userID: string;

    /** TEACHERID */
    @ManyToOne((type) => TeacherID, (TeacherID) => TeacherID.teacherID, {
        onDelete: 'NO ACTION',
        onUpdate: 'CASCADE',
    })
    @JoinColumn({ name: 'FK_RESERVATION_teacherID' })
    teacher: TeacherID;

    @Column({ name: 'FK_RESERVATION_teacherID' })
    teacherID: string;

    /** BRANCH */
    @ManyToOne((type) => Branch, (Branch) => Branch.branchName, {
        onDelete: 'NO ACTION',
        onUpdate: 'CASCADE',
    })
    @JoinColumn({ name: 'FK_RESERVATION_branch' })
    branch: Branch;

    @Column({ name: 'FK_RESERVATION_branch' })
    branchName: string;

    /** REGULARSCHEDULE */
    @ManyToOne((type) => RegularSchedule, (RegularSchedule) => RegularSchedule.id, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn({ name: 'FK_RESERVATION_regularID' })
    regular: RegularSchedule;

    @Column({ name: 'FK_RESERVATION_regularID' })
    regularID: number;

    setReservation(
        createReservationDto: CreateReservationDto,
        userID: string,
        status: number,
        regularID?: number,
    ) {
        this.branchName = createReservationDto.branchName;
        this.teacherID = createReservationDto.teacherID;
        this.startDate = createReservationDto.startDate;
        this.endDate = createReservationDto.endDate;
        this.bookingStatus = status;
        this.userID = userID;
        if (regularID) this.regularID = regularID;
    }

    toString(): string {
        return JSON.stringify(this, null, 4);
    }
}
