import { number } from '@hapi/joi';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ObjectLiteral } from 'typeorm';

export class SearchUserDto {
    @IsString()
    @IsOptional()
    @IsNotEmpty()
    @ApiProperty({ required: false })
    readonly branchName?: string;

    @IsString()
    @IsOptional()
    @IsNotEmpty()
    @ApiProperty({ required: false })
    readonly userID?: string;

    @IsInt()
    @IsOptional()
    @IsNotEmpty()
    @Type(() => Number)
    @ApiProperty({ required: false })
    readonly isPaid?: number;

    @IsInt()
    @IsOptional()
    @IsNotEmpty()
    @Type(() => Number)
    @ApiProperty({ required: false })
    readonly status?: number;

    getSqlString(): string {
        var sqlString: string = '';
        if (this.branchName) sqlString += 'User.FK_USER_branch = :branchName';
        if (this.userID) {
            if (sqlString) {
                sqlString += ' AND User.userID = :userID';
            } else {
                sqlString = 'User.userID = :userID';
            }
        }
        if (this.isPaid !== undefined) {
            var condition;
            if (this.isPaid === 0) {
                condition = 'IS NULL';
            } else {
                condition = 'IS NOT NULL';
            }
            if (sqlString) {
                sqlString += ' AND ledgers.id ' + condition;
            } else {
                sqlString = 'ledgers.id ' + condition;
            }
        }
        if (this.status !== undefined) {
            if (sqlString) {
                sqlString += ' AND User.status = :status';
            } else {
                sqlString = 'User.status = :status';
            }
        }
        return sqlString;
    }

    getSqlParams(): ObjectLiteral {
        var obj: ObjectLiteral = {};
        if (this.branchName) obj.branchName = this.branchName;
        if (this.userID) obj.userID = this.userID;
        if (this.status !== undefined) obj.status = this.status;
        return obj;
    }
}
