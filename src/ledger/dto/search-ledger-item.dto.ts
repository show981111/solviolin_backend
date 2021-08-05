import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SearchLedgerItemDto {
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    @ApiProperty()
    readonly branchName?: string;

    @IsInt()
    @IsNotEmpty()
    @ApiProperty()
    @IsOptional()
    @Type(() => Number)
    readonly termID?: number;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    @ApiProperty()
    readonly userID?: number;
}
