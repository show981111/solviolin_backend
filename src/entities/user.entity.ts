import { BranchRepository } from 'src/branch/branch.repository';
import { Branch } from 'src/entities/branch.entity';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import {
    Column,
    Entity,
    ManyToOne,
    PrimaryColumn,
    JoinColumn,
    OneToMany,
} from 'typeorm';
import { Reservation } from './reservation.entity';

@Entity('USER')
export class User {
    @PrimaryColumn('varchar', { length: 45 })
    userID: string;

    @OneToMany((type) => Reservation, (Reservation) => Reservation.user)
    reservations: Reservation[];

    @Column({ nullable: false })
    userPassword: string;

    @Column({ type: 'varchar', length: 45, nullable: false })
    userName: string;

    @Column({ type: 'varchar', length: 11, unique: true, nullable: false })
    userPhone: string;

    @Column({ type: 'tinyint', width: 3, nullable: false })
    userType: number;

    @ManyToOne((type) => Branch, (Branch) => Branch.branchName, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn({ name: 'FK_USER_branch' })
    branch: Branch;

    @Column({ name: 'FK_USER_branch' })
    branchName: string;

    @Column({ type: 'int', width: 11, nullable: false, default: 0 })
    userDuration: number;

    @Column({ type: 'int', width: 11, nullable: false, default: 0 })
    totalClassCount: number;

    @Column({ type: 'int', width: 11, nullable: false, default: 2 })
    userCredit: number;

    @Column({ type: 'varchar', length: 250, nullable: true })
    token: string;

    @Column({ type: 'tinyint', nullable: false })
    isPaid: number;

    @Column({ type: 'tinyint', nullable: false })
    status: number;

    @Column({ type: 'varchar', length: 250 })
    salt: string;

    @Column({ type: 'varchar', length: 45, nullable: true })
    color: string;

    @Column({ type: 'varchar', length: 250, default: '0' })
    refreshToken: string;

    public setUser(
        CreateUserDto: CreateUserDto,
        hashedPassword: string,
        salt: string,
    ): void {
        this.userID = CreateUserDto.userID;
        this.userPassword = hashedPassword;
        this.userName = CreateUserDto.userName;
        this.userPhone = CreateUserDto.userPhone;
        this.userType = CreateUserDto.userType;
        let br = new Branch(CreateUserDto.userBranch);
        this.branch = br;
        this.userDuration = CreateUserDto.userDuration;
        this.totalClassCount = CreateUserDto.totalClassCount;
        if (CreateUserDto.token) this.token = CreateUserDto.token;
        this.salt = salt;
    }
}
