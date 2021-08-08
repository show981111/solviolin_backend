import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Branch } from 'src/entities/branch.entity';
import { TeacherID } from 'src/entities/teacherID.entity';

export class BranchDowSearchDto {
    @IsString()
    @IsOptional()
    @IsNotEmpty()
    @ApiProperty({ required: false })
    readonly branchName?: string;

    @IsInt()
    @IsOptional()
    @IsNotEmpty()
    @IsIn([0, 1, 2, 3, 4, 5, 6])
    @Type(() => Number)
    @ApiProperty({ required: false })
    readonly workDow?: number;
}
