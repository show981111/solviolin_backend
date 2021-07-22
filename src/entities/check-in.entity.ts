import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Branch } from './branch.entity';

@Entity('CHECKIN')
export class CheckIn {
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
    @ApiProperty()
    branchName: string;

    @Column({ name: 'createdAt', type: 'datetime', default: Date.now() })
    @ApiProperty()
    createdAt: Date;
}
