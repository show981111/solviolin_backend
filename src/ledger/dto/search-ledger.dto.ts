import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class SearchLedgerDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly branchName: string;

    @IsInt()
    @IsNotEmpty()
    @ApiProperty()
    @Type(() => Number)
    readonly termID: number;
}
