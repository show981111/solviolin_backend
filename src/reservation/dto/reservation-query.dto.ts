import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { FindOperator, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';

interface searchQuery {
    branchName: string;
    teacherID?: string;
    startDate?: FindOperator<Date>;
    endDate?: FindOperator<Date>;
    userID?: string;
}

export class ReservationQuery {
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

    get getQuery(): searchQuery {
        var query: searchQuery = { branchName: this.branchName };

        if (this.teacherID) query.teacherID = this.teacherID;
        if (this.startDate) query.startDate = MoreThanOrEqual(this.startDate);
        if (this.endDate) query.endDate = LessThanOrEqual(this.endDate);
        if (this.userID) query.userID = this.userID;

        return query;
    }
}
