import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('TERM')
export class Term {
    @PrimaryColumn('datetime', { nullable: false })
    termStart: Date;

    @Column('datetime', { nullable: false })
    termEnd: Date;
}
