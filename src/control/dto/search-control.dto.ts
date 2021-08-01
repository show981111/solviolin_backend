import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsIn, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { FindOperator, LessThanOrEqual, MoreThanOrEqual, In } from 'typeorm';

interface searchFilter {
    branchName: string;
    teacherID?: string;
    startDate?: FindOperator<Date>;
    endDate?: FindOperator<Date>;
    status?: number;
}

export class ControlFilterDto {
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

    @IsInt()
    @IsIn([0, 1])
    @IsOptional()
    @ApiProperty()
    @ApiProperty({ required: false })
    readonly status?: number;

    get getFilter(): searchFilter {
        var filter: searchFilter = {
            branchName: this.branchName,
        };

        if (this.teacherID) filter.teacherID = this.teacherID;
        if (this.startDate) filter.startDate = MoreThanOrEqual(this.startDate);
        if (this.endDate) filter.endDate = LessThanOrEqual(this.endDate);
        if (this.status === 0 || this.status === 1) filter.status = this.status;
        return filter;
    }
}
