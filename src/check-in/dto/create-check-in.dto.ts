import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { IsValidBranchQR } from 'src/utils/validators/isValidBranchQR.decorator';

export class CreateCheckInDto {
    @IsString()
    @IsNotEmpty()
    @IsValidBranchQR({ message: 'invalid QR' })
    @ApiProperty()
    readonly branchCode: string;
}
