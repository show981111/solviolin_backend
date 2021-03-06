import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IsAfterStartTimeAndSameDate } from 'src/utils/validators/isAfterStartTimeAndSameDate.decorator';

export class CreateReservationDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly teacherID: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly branchName: string;

    @IsDate()
    @Type(() => Date)
    @ApiProperty()
    readonly startDate: Date;

    @IsDate()
    @IsAfterStartTimeAndSameDate('startDate')
    @Type(() => Date)
    @ApiProperty()
    readonly endDate: Date;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ required: false, description: "only required for admin's request" })
    readonly userID: string;
}
