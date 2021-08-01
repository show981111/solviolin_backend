import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsDate,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator';
import { FindOperator, LessThanOrEqual, MoreThanOrEqual, In } from 'typeorm';

interface searchFilter {
    branchName: string;
    teacherID?: string;
    startDate?: FindOperator<Date>;
    endDate?: FindOperator<Date>;
    userID?: string;
    bookingStatus: FindOperator<number>;
}

export class ReservationFilterDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly branchName: string;

    @IsString()
    @IsOptional()
    @IsNotEmpty()
    @ApiProperty({ required: false })
    readonly teacherID?: string;

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

    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
    readonly userID?: string;

    @IsArray()
    @IsNumber({}, { each: true })
    @ApiProperty()
    readonly bookingStatus: number[];

    get getFilter(): searchFilter {
        var filter: searchFilter = {
            branchName: this.branchName,
            bookingStatus: In(this.bookingStatus),
        };

        if (this.teacherID) filter.teacherID = this.teacherID;
        if (this.startDate) filter.startDate = MoreThanOrEqual(this.startDate);
        if (this.endDate) filter.endDate = LessThanOrEqual(this.endDate);
        if (this.userID) filter.userID = this.userID;

        return filter;
    }
}
