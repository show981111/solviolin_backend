import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';
import { IsAfterStart } from 'src/utils/decorators/isAfterStart.decorator';

export class CreateRegularDto {
    @IsString()
    @IsNotEmpty()
    readonly teacherID: string;

    @IsString()
    @IsNotEmpty()
    readonly branchName: string;

    @IsDate()
    @Type(() => Date)
    readonly startDate: Date;

    @IsDate()
    @IsAfterStart('startDate')
    @Type(() => Date)
    endDate: Date;

    @IsString()
    @IsNotEmpty()
    readonly userID: string;
}
