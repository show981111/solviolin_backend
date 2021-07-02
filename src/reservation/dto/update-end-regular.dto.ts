import { Transform, Type } from 'class-transformer';
import { IsDate, IsDateString, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Reservation } from 'src/entities/reservation.entity';
import { IsAfterStart } from 'src/utils/decorators/isAfterStart.decorator';

export class UpdateEndRegularDto {
    @IsDate()
    @Type(() => Date)
    readonly endDate: Date;
}
