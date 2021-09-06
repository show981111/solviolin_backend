import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CheckIn } from 'src/entities/check-in.entity';
import { FindConditions, FindManyOptions, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';

export class SearchCheckInDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly branchName: string;

    @IsOptional()
    @IsDate()
    @IsNotEmpty()
    @Type(() => Date)
    @ApiProperty({ required: false })
    readonly startDate?: Date;

    @IsOptional()
    @IsDate()
    @IsNotEmpty()
    @Type(() => Date)
    @ApiProperty({ required: false })
    readonly endDate?: Date;

    get getFilter(): FindConditions<CheckIn> {
        var filter: FindConditions<CheckIn> = {};

        if (this.branchName) filter.branchName = this.branchName;
        if (this.startDate) filter.createdAt = MoreThanOrEqual(this.startDate);
        if (this.endDate) filter.createdAt = LessThanOrEqual(this.endDate);
        return filter;
    }
}
