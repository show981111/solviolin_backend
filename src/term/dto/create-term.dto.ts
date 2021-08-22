import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate } from 'class-validator';
import { IsAfterStartTime } from 'src/utils/validators/isAfterStartTime.decorator';
import { IsAfterStartTimeAndSameDate } from 'src/utils/validators/isAfterStartTimeAndSameDate.decorator';

export class CreateTermDto {
    @IsDate()
    @Type(() => Date)
    @ApiProperty()
    readonly termStart: Date;

    @IsDate()
    @IsAfterStartTime('termStart')
    @Type(() => Date)
    @ApiProperty()
    readonly termEnd: Date;
}
