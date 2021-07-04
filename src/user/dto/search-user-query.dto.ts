import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SearchUserDto {
    @IsString()
    @IsOptional()
    @IsNotEmpty()
    readonly teacherID?: string;

    @IsString()
    @IsOptional()
    @IsNotEmpty()
    readonly branchName?: string;

    @IsString()
    @IsOptional()
    @IsNotEmpty()
    readonly userID?: string;
}
