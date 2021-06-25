import { IsIn, IsInt, IsMilitaryTime } from 'class-validator';

export class UpdateTeacherDto {
    @IsInt()
    @IsIn([0, 1, 2, 3, 4, 5, 6])
    readonly workDow: number;

    @IsMilitaryTime()
    readonly startTime: Date;

    @IsMilitaryTime()
    readonly endTime: Date;
}
