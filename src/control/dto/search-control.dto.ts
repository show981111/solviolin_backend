import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsIn, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { FindOperator, LessThanOrEqual, MoreThanOrEqual, In } from 'typeorm';

interface searchFilter {
    branchName: string;
    teacherID?: string;
    controlStart?: FindOperator<Date>;
    controlEnd?: FindOperator<Date>;
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
    readonly controlStart?: Date;

    @IsOptional()
    @IsDate()
    @IsNotEmpty()
    @Type(() => Date)
    @ApiProperty({ required: false })
    readonly controlEnd?: Date;

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
        if (this.controlStart) filter.controlStart = MoreThanOrEqual(this.controlStart);
        if (this.controlEnd) filter.controlEnd = LessThanOrEqual(this.controlEnd);
        if (this.status === 0 || this.status === 1) filter.status = this.status;
        return filter;
    }
}
