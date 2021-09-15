import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SearchLedgerItemDto {
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    @ApiProperty({ required: false })
    readonly branchName?: string;

    @IsInt()
    @IsNotEmpty()
    @ApiProperty({ required: false })
    @IsOptional()
    @Type(() => Number)
    readonly termID?: number;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    @ApiProperty({ required: false })
    readonly userID?: number;
}
