import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate } from 'class-validator';
import { IsAfterStart } from 'src/utils/decorators/isAfterStart.decorator';

export class CreateTermDto {
    @IsDate()
    @Type(() => Date)
    @ApiProperty()
    readonly termStart: Date;

    @IsDate()
    @IsAfterStart('termStart')
    @Type(() => Date)
    @ApiProperty()
    readonly termEnd: Date;
}
