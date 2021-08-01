import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';

export class AvailableSpotFilterDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly branchName: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly teacherID: string;

    @IsDate()
    @IsNotEmpty()
    @Type(() => Date)
    @ApiProperty()
    readonly startDate: Date;
}
