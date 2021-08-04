import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Branch } from './branch.entity';
import { Term } from './term.entity';
import { User } from './user.entity';

@Entity('LEDGER')
export class Ledger {
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
    @ApiProperty()
    termID: number;

    /** Branch */
    @ManyToOne((type) => Term, (Term) => Term.id, {
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
    })
    @JoinColumn({ name: 'FK_LEDGER_branch' })
    branch: Branch;

    @Column({ name: 'FK_LEDGER_branch' })
    @ApiProperty()
    branchName: string;

    @Column({ name: 'paidAt', type: 'datetime' })
    @ApiProperty()
    paidAt: Date;
}
