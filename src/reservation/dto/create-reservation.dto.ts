import { Transform, Type } from 'class-transformer';
import { IsDate, IsDateString, IsString } from 'class-validator';
import { IsAfterStart } from 'src/utils/decorators/isAfterStart.decorator';

export class CreateReservationDto {
    @IsString()
    readonly teacherID: string;

    @IsString()
    readonly branchName: string;

    @IsDate()
    @Type(() => Date)
    readonly startDate: Date;

    @IsDate()
    @IsAfterStart('startDate')
    @Type(() => Date)
    readonly endDate: Date;
}
