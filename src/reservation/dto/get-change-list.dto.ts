import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GetChangeListDto {
    @IsString()
    @IsIn(['cur', 'last', 'both'])
    @IsNotEmpty()
    @ApiProperty()
    readonly range: string;
}
