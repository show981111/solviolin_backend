import { ApiProperty } from '@nestjs/swagger';
import { CreateControlDto } from 'src/control/dto/create-control.dto';
import { Branch } from 'src/entities/branch.entity';
import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    Index,
    BaseEntity,
    RelationId,
} from 'typeorm';
import { TeacherID } from './teacherID.entity';

@Entity('CONTROL')
@Index('unique_row', ['controlStart', 'controlEnd', 'teacherID', 'branchName', 'status'], {
    unique: true,
})
export class Control extends BaseEntity {
    @PrimaryGeneratedColumn('increment')
    @ApiProperty()
    id: number;

    @Column({ type: 'datetime', nullable: false })
    @ApiProperty()
    controlStart: Date;

    @Column({ type: 'datetime', nullable: false })
    @ApiProperty()
    controlEnd: Date;

    @ManyToOne((type) => TeacherID, (TeacherID) => TeacherID.teacherID, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn({ name: 'FK_CONTROL_teacherID' })
    teacher: TeacherID;

    @Column({ name: 'FK_CONTROL_teacherID' })
    @RelationId((control: Control) => control.teacher)
    @ApiProperty()
    teacherID: string;

    @ManyToOne((type) => Branch, (Branch) => Branch.branchName, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn({ name: 'FK_CONTROL_branch' })
    branch: Branch;

    @Column({ name: 'FK_CONTROL_branch' })
    @RelationId((control: Control) => control.branch)
    @ApiProperty()
    branchName: string;

    @Column({ type: 'tinyint', nullable: false })
    @ApiProperty({ description: '0 is open, 1 is closed' })
    status: number;

    setControl(createControlDto: CreateControlDto): void {
        this.controlStart = createControlDto.controlStart;
        this.controlEnd = createControlDto.controlEnd;
        this.branchName = createControlDto.branchName;
        this.teacherID = createControlDto.teacherID;
        this.status = createControlDto.status;
    }
}
