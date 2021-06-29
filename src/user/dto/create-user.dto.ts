import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { IsValidPhoneNumber } from 'src/utils/decorators/validate-phone.decorator';

export class CreateUserDto {
    @IsString()
    readonly userID: string;

    @IsString()
    readonly userPassword: string;

    @IsString()
    readonly userName: string;

    @IsValidPhoneNumber({ message: 'userPhone must be a valid phone number' })
    readonly userPhone: string;

    @IsInt()
    @Min(0)
    @Max(2)
    readonly userType: number;

    @IsString()
    readonly userBranch: string;

    @IsInt()
    @IsIn([30, 45, 60])
    readonly userDuration: number;

    @IsInt()
    @IsIn([4, 8])
    readonly totalClassCount: number;

    @IsOptional()
    readonly token: string;
}
