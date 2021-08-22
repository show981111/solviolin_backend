import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, Length } from 'class-validator';
import { IsValidPhoneNumber } from 'src/utils/validators/validate-phone.decorator';

export class SendSMSDto {
    @IsString()
    @IsValidPhoneNumber({ message: 'please input valid phone number ex)01012341234' })
    @IsNotEmpty()
    @ApiProperty()
    from: string;

    @IsArray()
    @IsString({ each: true })
    @IsValidPhoneNumber({ each: true, message: 'please input valid phone number ex)01012341234' })
    @IsNotEmpty()
    @ApiProperty()
    readonly to: string[];
}
