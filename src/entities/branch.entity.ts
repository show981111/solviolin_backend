import { User } from 'src/entities/user.entity';
import { Entity, OneToMany, PrimaryColumn } from 'typeorm';

@Entity('BRANCH')
export class Branch {
    @PrimaryColumn('varchar', { length: 10, nullable: false })
    branchName: string;

    @OneToMany((type) => User, (User) => User.branchName)
    users: User[];
}
