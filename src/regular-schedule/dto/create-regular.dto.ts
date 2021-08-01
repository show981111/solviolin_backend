import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';
import { IsAfterStartTimeAndSameDate } from 'src/utils/validators/isAfterStartTimeAndSameDate.decorator';

export class CreateRegularDto {
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
    endDate: Date;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly userID: string;
}
