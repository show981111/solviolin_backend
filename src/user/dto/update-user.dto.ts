import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';
import { User } from 'src/entities/user.entity';
import { IsValidPhoneNumber } from 'src/utils/decorators/validate-phone.decorator';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

export class UpdateUserDto {
    @IsString()
    @IsOptional()
    @IsNotEmpty()
    readonly userName: string;

    @IsValidPhoneNumber({ message: 'userPhone must be a valid phone number' })
    @IsOptional()
    @IsNotEmpty()
    readonly userPhone: string;

    @IsString()
    @IsOptional()
    @IsNotEmpty()
    readonly userBranch: string;

    @IsInt()
    @IsIn([30, 45, 60])
    @IsOptional()
    @IsNotEmpty()
    readonly userDuration: number;

    @IsInt()
    @IsIn([4, 8])
    @IsOptional()
    @IsNotEmpty()
    readonly totalClassCount: number;

    @IsInt()
    @IsOptional()
    @IsNotEmpty()
    readonly userCredit: number;

    @IsInt()
    @IsIn([0, 1])
    @IsOptional()
    @IsNotEmpty()
    readonly status: number;

    @IsInt()
    @IsIn([0, 1])
    @IsOptional()
    @IsNotEmpty()
    readonly isPaid: number;

    @IsString()
    @IsOptional()
    @IsNotEmpty()
    readonly token: string;

    getBody(): QueryDeepPartialEntity<User> {
        let body: QueryDeepPartialEntity<User>;
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
}