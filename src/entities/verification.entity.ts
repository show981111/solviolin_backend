import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('VERIFICATION')
export class Verification extends BaseEntity {
    @PrimaryColumn('varchar', { length: 45 })
    @ApiProperty()
    userID: string;

    @Column('varchar', { length: 250 })
    @ApiProperty()
    code: string;

    @Column('datetime', { nullable: true })
    @ApiProperty()
    verifiedAt: Date;

    @Column('datetime', { default: new Date(new Date().getTime() + 9 * 60 * 60 * 1000) })
    @ApiProperty()
    issuedAt: Date;
}
