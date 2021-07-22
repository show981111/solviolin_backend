import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';
import { IsAfterStart } from 'src/utils/validators/isAfterStart.decorator';

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
    @IsAfterStart('startDate')
    @Type(() => Date)
    @ApiProperty()
    endDate: Date;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly userID: string;
}
