import { Type } from 'class-transformer';
import { IsDate, IsDateString, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IsAfterStart } from 'src/utils/decorators/isAfterStart.decorator';

export class CreateTermDto {
    @IsDate()
    @Type(() => Date)
    readonly termStart: Date;

    @IsDate()
    @IsAfterStart('termStart')
    @Type(() => Date)
    readonly termEnd: Date;
}
