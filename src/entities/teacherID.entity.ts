import { Column, Entity, PrimaryColumn, OneToMany } from 'typeorm';
import { Control } from './control.entity';
import { Reservation } from './reservation.entity';
import { Teacher } from './teacher.entity';

@Entity('TEACHERID')
export class TeacherID {
    @PrimaryColumn('varchar', { length: 45 })
    teacherID: string;

    @OneToMany((type) => Teacher, (Teacher) => Teacher.teacher)
    teachers: Teacher[];

    @OneToMany((type) => Control, (Control) => Control.teacher)
    controls: Control[];

    @OneToMany((type) => Reservation, (Reservation) => Reservation.teacher)
    reservations: Reservation[];

    constructor(teacherID: string) {
        this.teacherID = teacherID;
    }
}
