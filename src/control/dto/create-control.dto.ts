import { IsDate, IsDateString, IsIn, IsInt, IsString } from 'class-validator';
import { IsAfterStart } from 'src/utils/isAfterStart.decorator';

export class CreateControlDto {
    @IsString()
    teacherID: string;

    @IsString()
    readonly teacherBranch: string;

    @IsDateString()
    readonly controlStart: Date;

    @IsDateString()
    @IsAfterStart('controlStart')
    readonly controlEnd: Date;

    @IsInt()
    @IsIn([0, 1])
    readonly status: number;
}
