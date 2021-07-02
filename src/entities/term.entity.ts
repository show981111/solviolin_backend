import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { RegularSchedule } from './regularSchedule.entity';

@Entity('TERM')
export class Term {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column('datetime', { nullable: false })
    termStart: Date;

    @Column('datetime', { nullable: false })
    termEnd: Date;

    @OneToMany((type) => RegularSchedule, (RegularSchedule) => RegularSchedule.term)
    regularSchedules: RegularSchedule[];
}
