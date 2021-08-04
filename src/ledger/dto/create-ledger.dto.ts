import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateLedgerDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly userID: string;

    @IsInt()
    @IsNotEmpty()
    @ApiProperty()
    readonly amount: number;

    @IsInt()
    @IsNotEmpty()
    @ApiProperty()
    readonly termID: number;
}
