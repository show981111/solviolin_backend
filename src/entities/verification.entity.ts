import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('VERIFICATION')
export class Verification {
    @PrimaryColumn('varchar', { length: 45 })
    id: number;

    @Column('varchar', { length: 250 })
    code: string;

    @Column('datetime', { nullable: true })
    verifiedAt: Date;

    @Column('datetime', { default: new Date(new Date().getTime() + 9 * 60 * 60 * 1000) })
    issuedAt: Date;
}
