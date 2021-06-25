import { Branch } from 'src/entities/branch.entity';
import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { TeacherID } from './teacherID.entity';

@Entity('CONTROL')
export class Control {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ type: 'datetime', nullable: false })
    controlStart: Date;

    @Column({ type: 'datetime', nullable: false })
    controlEnd: Date;

    @ManyToOne((type) => TeacherID, (TeacherID) => TeacherID.teacherID, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn({ name: 'FK_CONTROL_teacherID' })
    teacher: TeacherID;

    @Column({ name: 'FK_CONTROL_teacherID' })
    teacherID: string;

    @ManyToOne((type) => Branch, (Branch) => Branch.branchName, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn({ name: 'FK_CONTROL_branch' })
    branch: Branch;

    @Column({ name: 'FK_CONTROL_branch' })
    branchName: string;

    @Column({ type: 'tinyint', nullable: false })
    status: number;
}
