import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CalculateIncomeDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly branchName: string;

    @IsInt()
    @IsNotEmpty()
    @ApiProperty()
    readonly termID: number;

    @IsInt()
    @IsNotEmpty()
    @ApiProperty()
    readonly dayTimeCost: number;

    @IsInt()
    @IsNotEmpty()
    @ApiProperty()
    readonly nightTimeCost: number;
}
