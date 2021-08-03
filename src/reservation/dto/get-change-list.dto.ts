import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GetChangeListDto {
    @IsString()
    @IsIn(['cur', 'last', 'both'])
    @IsNotEmpty()
    @ApiProperty()
    readonly range: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'admin이 요청할떄는 required', required: false })
    userID?: string;
}
