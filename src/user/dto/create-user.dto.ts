import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { IsValidPhoneNumber } from 'src/utils/validators/validate-phone.decorator';

export class CreateUserDto {
    @IsString()
    @ApiProperty()
    readonly userID: string;

    @IsString()
    @ApiProperty()
    readonly userPassword: string;

    @IsString()
    @ApiProperty()
    readonly userName: string;

    @IsValidPhoneNumber({ message: 'userPhone must be a valid phone number' })
    @ApiProperty()
    readonly userPhone: string;

    @IsInt()
    @Min(0)
    @Max(2)
    @ApiProperty()
    readonly userType: number;

    @IsString()
    @ApiProperty()
    readonly userBranch: string;

    @IsOptional()
    @ApiProperty({ required: false })
    readonly token: string;
}
