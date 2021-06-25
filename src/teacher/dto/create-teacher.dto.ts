import { IsDate, IsIn, IsInt, IsMilitaryTime, IsString } from 'class-validator';

export class CreateTeacherDto {
    @IsString()
    readonly teacherID: string;

    @IsString()
    readonly teacherBranch: string;

    @IsInt()
    @IsIn([0, 1, 2, 3, 4, 5, 6])
    readonly workDow: number;

    @IsMilitaryTime()
    readonly startTime: Date;

    @IsMilitaryTime()
    readonly endTime: Date;
}
