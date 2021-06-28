import { IsDateString, IsString } from 'class-validator';
import { IsAfterStart } from 'src/utils/isAfterStart.decorator';

export class CreateReservationDto {
    @IsString()
    readonly teacherID: string;

    @IsString()
    readonly branchName: string;

    @IsDateString()
    readonly startDate: Date;

    @IsDateString()
    @IsAfterStart('startDate')
    readonly endDate: Date;
}
