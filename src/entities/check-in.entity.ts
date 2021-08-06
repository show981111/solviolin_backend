import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/entities/user.entity';
import {
    BaseEntity,
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    RelationId,
} from 'typeorm';
import { Branch } from './branch.entity';

@Entity('CHECKIN')
export class CheckIn extends BaseEntity {
    @PrimaryGeneratedColumn('increment')
    @ApiProperty()
    id: number;

    /** USER */
    @ManyToOne((type) => User, (User) => User.userID, {
        onDelete: 'NO ACTION',
        onUpdate: 'CASCADE',
    })
    @JoinColumn({ name: 'FK_CHECKIN_userID' })
    user: User;

    @Column({ name: 'FK_CHECKIN_userID' })
    @RelationId((checkIn: CheckIn) => checkIn.user)
    @ApiProperty()
    userID: string;

    /** BRANCH */
    @ManyToOne((type) => Branch, (Branch) => Branch.branchName, {
        onDelete: 'NO ACTION',
        onUpdate: 'CASCADE',
    })
    @JoinColumn({ name: 'FK_CHECKIN_branch' })
    branch: Branch;

    @Column({ name: 'FK_CHECKIN_branch' })
    @RelationId((checkIn: CheckIn) => checkIn.branch)
    @ApiProperty()
    branchName: string;

    @Column({ name: 'createdAt', type: 'datetime', default: Date.now() })
    @ApiProperty()
    createdAt: Date;
}
