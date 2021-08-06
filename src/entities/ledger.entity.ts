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
import { Branch } from './branch.entity';
import { Term } from './term.entity';
import { User } from './user.entity';

@Entity('LEDGER')
export class Ledger extends BaseEntity {
    @PrimaryGeneratedColumn('increment')
    @ApiProperty()
    id: number;

    @Column({ name: 'amount' })
    @ApiProperty()
    amount: number;

    /** user */
    @ManyToOne((type) => User, (User) => User.userID, {
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
    })
    @JoinColumn({ name: 'FK_LEDGER_userID' })
    user: User;

    @Column({ name: 'FK_LEDGER_userID' })
    @RelationId((ledger: Ledger) => ledger.user)
    @ApiProperty()
    userID: string;

    /** Term */
    @ManyToOne((type) => Term, (Term) => Term.id, {
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
    })
    @JoinColumn({ name: 'FK_LEDGER_termID' })
    term: Term;

    @Column({ name: 'FK_LEDGER_termID' })
    @RelationId((ledger: Ledger) => ledger.term)
    @ApiProperty()
    termID: number;

    /** Branch */
    @ManyToOne((type) => Branch, (Branch) => Branch.branchName, {
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
    })
    @JoinColumn({ name: 'FK_LEDGER_branch' })
    branch: Branch;

    @Column({ name: 'FK_LEDGER_branch' })
    @RelationId((ledger: Ledger) => ledger.branch)
    @ApiProperty()
    branchName: string;

    @Column({ name: 'paidAt', type: 'datetime' })
    @ApiProperty()
    paidAt: Date;
}
