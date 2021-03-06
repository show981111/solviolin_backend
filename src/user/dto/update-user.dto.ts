import { ApiProperty } from '@nestjs/swagger';
import {
    IsHexColor,
    IsIn,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Max,
    Min,
} from 'class-validator';
import { User } from 'src/entities/user.entity';
import { IsValidPhoneNumber } from 'src/utils/validators/validate-phone.decorator';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

export class UpdateUserDto {
    @IsString()
    @IsOptional()
    @IsNotEmpty()
    @ApiProperty({ required: false })
    readonly userName?: string;

    @IsValidPhoneNumber({ message: 'userPhone must be a valid phone number' })
    @IsOptional()
    @IsNotEmpty()
    @ApiProperty({ required: false })
    readonly userPhone?: string;

    @IsString()
    @IsOptional()
    @IsNotEmpty()
    @ApiProperty({ required: false })
    readonly userBranch?: string;

    @IsInt()
    @IsOptional()
    @IsNotEmpty()
    @ApiProperty({ required: false })
    readonly userCredit?: number;

    @IsInt()
    @IsIn([0, 1])
    @IsOptional()
    @IsNotEmpty()
    @ApiProperty({ required: false })
    readonly status?: number;

    @IsString()
    @IsOptional()
    @IsNotEmpty()
    @ApiProperty({ required: false })
    readonly token?: string;

    @IsHexColor()
    @IsOptional()
    @IsNotEmpty()
    @ApiProperty({ required: false })
    readonly color?: string;

    getBody(): QueryDeepPartialEntity<User> {
        let body: QueryDeepPartialEntity<User> = {};
        if (this.userName) body.userName = this.userName;
        if (this.userPhone) body.userPhone = this.userPhone;
        if (this.userBranch) body.branchName = this.userBranch;
        if (this.userCredit !== undefined) body.userCredit = this.userCredit;
        if (this.status !== undefined) body.status = this.status;
        if (this.token) body.token = this.token;

        return body;
    }

    isEmpty(): Boolean {
        return (
            !this.userName &&
            !this.userPhone &&
            !this.userBranch &&
            this.userCredit === undefined &&
            this.status === undefined &&
            !this.token
        );
    }
}
