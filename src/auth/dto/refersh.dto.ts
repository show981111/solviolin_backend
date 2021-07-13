import { ApiProperty } from '@nestjs/swagger';
import { IsJWT, IsNotEmpty, IsString } from 'class-validator';

export class RefreshDto {
    @IsString()
    @IsNotEmpty()
    @IsJWT()
    @ApiProperty()
    readonly refershToken: string;
}
