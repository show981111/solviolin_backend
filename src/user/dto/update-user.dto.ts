import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';
import { User } from 'src/entities/user.entity';
import { IsValidPhoneNumber } from 'src/utils/validators/validate-phone.decorator';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

export class UpdateUserDto {
    @IsString()
    @IsOptional()
    @IsNotEmpty()
    @ApiProperty({ required: false })
    readonly userName: string;

    @IsValidPhoneNumber({ message: 'userPhone must be a valid phone number' })
    @IsOptional()
    @IsNotEmpty()
    @ApiProperty({ required: false })
    readonly userPhone: string;

    @IsString()
    @IsOptional()
    @IsNotEmpty()
    @ApiProperty({ required: false })
    readonly userBranch: string;

    @IsInt()
    @IsIn([30, 45, 60])
    @IsOptional()
    @IsNotEmpty()
    @ApiProperty({ required: false })
    readonly userDuration: number;

    @IsInt()
    @IsIn([4, 8])
    @IsOptional()
    @IsNotEmpty()
    @ApiProperty({ required: false })
    readonly totalClassCount: number;

    @IsInt()
    @IsOptional()
    @IsNotEmpty()
    @ApiProperty({ required: false })
    readonly userCredit: number;

    @IsInt()
    @IsIn([0, 1])
    @IsOptional()
    @IsNotEmpty()
    @ApiProperty({ required: false })
    readonly status: number;

    @IsInt()
    @IsIn([0, 1])
    @IsOptional()
    @IsNotEmpty()
    @ApiProperty()
    @ApiProperty({ required: false })
    readonly isPaid: number;

    @IsString()
    @IsOptional()
    @IsNotEmpty()
    @ApiProperty({ required: false })
    readonly token: string;

    getBody(): QueryDeepPartialEntity<User> {
        let body: QueryDeepPartialEntity<User> = {};
        if (this.userName) body.userName = this.userName;
        if (this.userPhone) body.userPhone = this.userPhone;
        if (this.userDuration) body.userDuration = this.userDuration;
        if (this.userBranch) body.branchName = this.userBranch;
        if (this.totalClassCount) body.totalClassCount = this.totalClassCount;
        if (this.userCredit) body.userCredit = this.userCredit;
        if (this.status) body.status = this.status;
        if (this.isPaid) body.isPaid = this.isPaid;
        if (this.token) body.token = this.token;

        return body;
    }

    isEmpty(): Boolean {
        return (
            !this.userName &&
            !this.userPhone &&
            !this.userDuration &&
            !this.userBranch &&
            !this.totalClassCount &&
            !this.userCredit &&
            !this.status &&
            !this.isPaid &&
            !this.token
        );
    }
}
