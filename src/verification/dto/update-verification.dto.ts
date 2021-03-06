import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateVerificationDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly userID: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly input: string;
}
