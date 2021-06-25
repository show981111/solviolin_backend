import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Branch } from 'src/entities/branch.entity';
import { TeacherID } from 'src/entities/teacherID.entity';
interface Query {
    branch?: Branch;
    teacher?: TeacherID;
}

export class QueryTeacherDto {
    @IsString()
    @IsOptional()
    @IsNotEmpty()
    readonly teacherID: string;

    @IsString()
    @IsOptional()
    @IsNotEmpty()
    readonly branchName: string;

    get getQuery(): Query {
        var query: Query = {};

        if (this.branchName) query.branch = new Branch(this.branchName);
        if (this.teacherID) query.teacher = new TeacherID(this.teacherID);
        return query;
    }
}
