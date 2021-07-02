import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBranch {
    @IsString()
    @IsNotEmpty()
    readonly branchName: string;
}
