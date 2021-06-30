import { Transform, Type } from 'class-transformer';
import { IsDate, IsDateString, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Reservation } from 'src/entities/reservation.entity';
import { IsAfterStart } from 'src/utils/decorators/isAfterStart.decorator';

export class CreateReservationDto {
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
    readonly endDate: Date;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    readonly userID: string;
}
