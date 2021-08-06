import { ApiProperty } from '@nestjs/swagger';
import {
    BaseEntity,
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    RelationId,
} from 'typeorm';
import { Reservation } from './reservation.entity';

@Entity('LINK')
export class Link extends BaseEntity {
    @PrimaryGeneratedColumn('increment')
    @ApiProperty()
    id: number;

    /** From */
    @ManyToOne((type) => Reservation, (Reservation) => Reservation.id, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn({ name: 'FK_LINK_from' })
    from: Reservation;

    @Column({ name: 'FK_LINK_from' })
    @RelationId((link: Link) => link.from)
    @ApiProperty()
    fromID: number;

    /** To */
    @ManyToOne((type) => Reservation, (Reservation) => Reservation.id, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn({ name: 'FK_LINK_to' })
    to: Reservation;

    @Column({ name: 'FK_LINK_to' })
    @RelationId((link: Link) => link.to)
    @ApiProperty()
    toID: number;

    @Column({ type: 'tinyint' })
    @ApiProperty()
    isPostponed: number;

    @Column({ type: 'int' })
    @ApiProperty()
    used: number;
}
