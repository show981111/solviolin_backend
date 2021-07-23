import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBranch {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly branchName: string;
}
