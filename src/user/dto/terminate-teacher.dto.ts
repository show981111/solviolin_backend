import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';

export class TerminateTeacherDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly teacherID: string;

    @IsDate()
    @IsNotEmpty()
    @Type(() => Date)
    @ApiProperty({ required: false })
    readonly endDate: Date;
}
