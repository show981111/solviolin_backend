import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsDateString, IsIn, IsInt, IsString } from 'class-validator';
import { IsAfterStartTime } from 'src/utils/validators/isAfterStartTime.decorator';

export class CreateControlDto {
    @IsString()
    @ApiProperty({ description: "it can be a value 'all'. then it create controls of all teacher" })
    teacherID: string;

    @IsString()
    @ApiProperty()
    readonly branchName: string;

    @IsDateString()
    @ApiProperty()
    readonly controlStart: Date;

    @IsDateString()
    @IsAfterStartTime('controlStart')
    @ApiProperty({ description: 'must be after controlStart' })
    readonly controlEnd: Date;

    @IsInt()
    @IsIn([0, 1])
    @ApiProperty({ description: '0 : open or 1 : closed' })
    readonly status: number;
}
