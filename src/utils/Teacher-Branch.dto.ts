import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Branch } from 'src/entities/branch.entity';
import { TeacherID } from 'src/entities/teacherID.entity';
import { TeacherBranchQuery } from './interface/Teacher-Branch-Query.interface';

export class TeacherBranchDto {
    @IsString()
    @IsOptional()
    @IsNotEmpty()
    readonly teacherID?: string;

    @IsString()
    @IsOptional()
    @IsNotEmpty()
    readonly branchName?: string;

    get getQuery(): TeacherBranchQuery {
        var query: TeacherBranchQuery = {};

        if (this.branchName) query.branch = new Branch(this.branchName);
        if (this.teacherID) query.teacher = new TeacherID(this.teacherID);
        return query;
    }
}
