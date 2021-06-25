import { Column, Entity, PrimaryColumn, OneToMany } from 'typeorm';
import { Control } from './control.entity';
import { Teacher } from './teacher.entity';

@Entity('TEACHERID')
export class TeacherID {
    @PrimaryColumn('varchar', { length: 45 })
    teacherID: string;

    @OneToMany((type) => Teacher, (Teacher) => Teacher.teacher)
    teachers: Teacher[];

    @OneToMany((type) => Control, (Control) => Control.teacher)
    controls: Control[];

    constructor(teacherID: string) {
        this.teacherID = teacherID;
    }
}
