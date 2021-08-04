import { ApiProperty } from '@nestjs/swagger';
import { BranchRepository } from 'src/branch/branch.repository';
import { Branch } from 'src/entities/branch.entity';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { Column, Entity, ManyToOne, PrimaryColumn, JoinColumn, OneToMany } from 'typeorm';
import { CheckIn } from './check-in.entity';
import { Ledger } from './ledger.entity';
import { RegularSchedule } from './regularSchedule.entity';
import { Reservation } from './reservation.entity';

@Entity('USER')
export class User {
    @PrimaryColumn('varchar', { length: 45 })
    @ApiProperty({})
    userID: string;

    @OneToMany((type) => Reservation, (Reservation) => Reservation.user)
    reservations: Reservation[];

    @OneToMany((type) => RegularSchedule, (RegularSchedule) => RegularSchedule.user)
    regularSchedules: RegularSchedule[];

    @OneToMany((type) => CheckIn, (CheckIn) => CheckIn.user)
    checkIns: CheckIn[];

    @OneToMany((type) => Ledger, (Ledger) => Ledger.user)
    ledgers: Ledger[];

    @Column({ nullable: false })
    userPassword: string;

    @Column({ type: 'varchar', length: 45, nullable: false })
    @ApiProperty({})
    userName: string;

    @Column({ type: 'varchar', length: 11, unique: true, nullable: false })
    @ApiProperty({})
    userPhone: string;

    @Column({ type: 'tinyint', width: 3, nullable: false })
    @ApiProperty({})
    userType: number;

    @ManyToOne((type) => Branch, (Branch) => Branch.branchName, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn({ name: 'FK_USER_branch' })
    branch: Branch;

    @Column({ name: 'FK_USER_branch' })
    @ApiProperty({})
    branchName: string;

    @Column({ type: 'int', width: 11, nullable: false, default: 2 })
    @ApiProperty({})
    userCredit: number;

    @Column({ type: 'varchar', length: 250, nullable: true })
    @ApiProperty({})
    token: string;

    @Column({ type: 'tinyint', nullable: false })
    @ApiProperty({})
    status: number;

    @Column({ type: 'varchar', length: 250 })
    @ApiProperty({})
    salt: string;

    @Column({ type: 'varchar', length: 45, nullable: true })
    @ApiProperty({})
    color: string;

    @Column({ type: 'varchar', length: 250, default: '0' })
    @ApiProperty({})
    refreshToken: string;

    public setUser(CreateUserDto: CreateUserDto, hashedPassword: string, salt: string): void {
        this.userID = CreateUserDto.userID;
        this.userPassword = hashedPassword;
        this.userName = CreateUserDto.userName;
        this.userPhone = CreateUserDto.userPhone;
        this.userType = CreateUserDto.userType;
        let br = new Branch(CreateUserDto.userBranch);
        this.branch = br;
        if (CreateUserDto.token) this.token = CreateUserDto.token;
        this.salt = salt;
    }
}
