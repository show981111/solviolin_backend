import { Body, Controller, Get, Post, UseFilters, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAdminGuard } from 'src/auth/guards/jwt-admin.guard';
import { Branch } from 'src/entities/branch.entity';
import { TypeOrmExceptionFilter } from 'src/utils/filters/typeOrmException.filter';
import { InsertResult } from 'typeorm';
import { BranchService } from './branch.service';
import { CreateBranch } from './dto/create-branch.dto';

@Controller('branch')
@UseFilters(TypeOrmExceptionFilter)
@ApiTags('Branch API')
export class BranchController {
    constructor(private readonly branchService: BranchService) {}

    @Post()
    @UseGuards(JwtAdminGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'create branch' })
    postBranch(@Body() createBranch: CreateBranch): Promise<InsertResult> {
        return this.branchService.createBranch(createBranch.branchName);
    }

    @Get()
    @ApiOperation({ summary: 'get branch' })
    getBranch(): Promise<Branch[]> {
        return this.branchService.getAllbranch();
    }
}
