import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateVerificationDto {
    @IsString()
    @IsNotEmpty()
    readonly userID: string;

    @IsString()
    @IsNotEmpty()
    readonly input: string;
}
