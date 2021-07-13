import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate } from 'class-validator';

export class UpdateEndRegularDto {
    @IsDate()
    @Type(() => Date)
    @ApiProperty()
    readonly endDate: Date;
}
