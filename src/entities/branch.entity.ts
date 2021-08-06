import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/entities/user.entity';
import { BaseEntity, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Control } from './control.entity';
import { Ledger } from './ledger.entity';
import { RegularSchedule } from './regularSchedule.entity';
import { Reservation } from './reservation.entity';
import { Teacher } from './teacher.entity';

@Entity('BRANCH')
export class Branch extends BaseEntity {
    @PrimaryColumn('varchar', { length: 10, nullable: false })
    @ApiProperty()
    branchName: string;

    @OneToMany((type) => User, (User) => User.branch)
    users: User[];

    @OneToMany((type) => Teacher, (Teacher) => Teacher.branch)
    teachers: Teacher[];

    @OneToMany((type) => Control, (Control) => Control.branch)
    controls: Control[];

    @OneToMany((type) => Reservation, (Reservation) => Reservation.branch)
    reservations: Reservation[];

    @OneToMany((type) => RegularSchedule, (RegularSchedule) => RegularSchedule.branch)
    regularSchedules: RegularSchedule[];

    @OneToMany((type) => Ledger, (Ledger) => Ledger.branch)
    ledgers: Ledger[];

    constructor(branch: string) {
        super();
        this.branchName = branch;
    }
}
