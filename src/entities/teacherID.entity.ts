import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryColumn, OneToMany, BaseEntity } from 'typeorm';
import { Control } from './control.entity';
import { RegularSchedule } from './regularSchedule.entity';
import { Reservation } from './reservation.entity';
import { Teacher } from './teacher.entity';

@Entity('TEACHERID')
export class TeacherID extends BaseEntity {
    @PrimaryColumn('varchar', { length: 45 })
    teacherID: string;

    @Column({ type: 'varchar', length: 45, nullable: true })
    @ApiProperty({})
    color: string;

    @Column({ type: 'datetime', nullable: true })
    @ApiProperty({})
    endDate: Date;

    @OneToMany((type) => Teacher, (Teacher) => Teacher.teacher)
    teachers: Teacher[];

    @OneToMany((type) => Control, (Control) => Control.teacher)
    controls: Control[];

    @OneToMany((type) => Reservation, (Reservation) => Reservation.teacher)
    reservations: Reservation[];

    @OneToMany((type) => RegularSchedule, (RegularSchedule) => RegularSchedule.teacher)
    regularSchedules: RegularSchedule[];

    constructor(teacherID: string) {
        super();
        this.teacherID = teacherID;
    }
}
