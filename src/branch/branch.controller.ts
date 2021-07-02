import { Body, Controller, Post, UseFilters, UseGuards } from '@nestjs/common';
import { JwtAdminGuard } from 'src/auth/guards/jwt-admin.guard';
import { TypeOrmExceptionFilter } from 'src/utils/filters/typeOrmException.filter';
import { InsertResult } from 'typeorm';
import { BranchService } from './branch.service';
import { CreateBranch } from './dto/create-branch.dto';

@Controller('branch')
@UseFilters(TypeOrmExceptionFilter)
export class BranchController {
    constructor(private readonly branchService: BranchService) {}

    @Post()
    @UseGuards(JwtAdminGuard)
    postBranch(@Body() createBranch: CreateBranch): Promise<InsertResult> {
        return this.branchService.createBranch(createBranch.branchName);
    }
}
