import { CreateControlDto } from 'src/control/dto/create-control.dto';
import { Branch } from 'src/entities/branch.entity';
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { TeacherID } from './teacherID.entity';

@Entity('CONTROL')
@Index('unique_row', ['controlStart', 'controlEnd', 'teacherID', 'branchName', 'status'], {
    unique: true,
})
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

    setControl(createControlDto: CreateControlDto): void {
        this.controlStart = createControlDto.controlStart;
        this.controlEnd = createControlDto.controlEnd;
        this.branchName = createControlDto.branchName;
        this.teacherID = createControlDto.teacherID;
        this.status = createControlDto.status;
    }
}
