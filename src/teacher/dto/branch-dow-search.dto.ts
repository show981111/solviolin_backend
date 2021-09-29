import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { FindOperator, MoreThanOrEqual } from 'typeorm';

interface searchFilter {
    branchName?: string;
    workDow?: number;
    endDate?: FindOperator<Date>;
}

export class BranchDowSearchDto {
    @IsString()
    @IsOptional()
    @IsNotEmpty()
    @ApiProperty({ required: false })
    readonly branchName?: string;

    @IsInt()
    @IsOptional()
    @IsNotEmpty()
    @IsIn([0, 1, 2, 3, 4, 5, 6])
    @Type(() => Number)
    @ApiProperty({ required: false })
    readonly workDow?: number;

    // @IsDate()
    // @IsNotEmpty()
    // @IsOptional()
    // @Type(() => Date)
    // @ApiProperty({ required: false })
    // readonly from?: Date;

    // get getQuery(): searchFilter {
    //     var query: searchFilter = {};

    //     if (this.branchName) query.branchName = this.branchName;
    //     if (this.workDow) query.workDow = this.workDow;
    //     if (this.from) query.endDate = MoreThanOrEqual(this.from);
    //     return query;
    // }
}
