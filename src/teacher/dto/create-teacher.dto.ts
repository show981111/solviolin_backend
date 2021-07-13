import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsIn, IsInt, IsMilitaryTime, IsString } from 'class-validator';
import { IsAfterStartTime } from 'src/utils/decorators/isAfterStartTime.decorator';

export class CreateTeacherDto {
    @IsString()
    @ApiProperty()
    readonly teacherID: string;

    @IsString()
    @ApiProperty()
    readonly teacherBranch: string;

    @IsInt()
    @IsIn([0, 1, 2, 3, 4, 5, 6])
    @ApiProperty()
    readonly workDow: number;

    @IsMilitaryTime()
    @ApiProperty({ format: 'time', example: '12:00' })
    readonly startTime: Date;

    @IsMilitaryTime()
    @IsAfterStartTime('startTime')
    @ApiProperty({ format: 'time', example: '12:30' })
    readonly endTime: Date;
}
