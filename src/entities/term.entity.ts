import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn, OneToMany, BaseEntity } from 'typeorm';
import { Ledger } from './ledger.entity';
import { RegularSchedule } from './regularSchedule.entity';

@Entity('TERM')
export class Term extends BaseEntity {
    @PrimaryGeneratedColumn('increment')
    @ApiProperty()
    id: number;

    @Column('datetime', { nullable: false })
    @ApiProperty()
    termStart: Date;

    @Column('datetime', { nullable: false })
    @ApiProperty()
    termEnd: Date;

    @OneToMany((type) => RegularSchedule, (RegularSchedule) => RegularSchedule.term)
    regularSchedules: RegularSchedule[];

    @OneToMany((type) => Ledger, (Ledger) => Ledger.term)
    ledgers: Ledger[];
}
