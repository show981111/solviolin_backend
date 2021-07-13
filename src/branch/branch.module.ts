import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Branch } from 'src/entities/branch.entity';
import { BranchController } from './branch.controller';
import { BranchRepository } from './branch.repository';
import { BranchService } from './branch.service';

@Module({
    imports: [TypeOrmModule.forFeature([BranchRepository])],
    controllers: [BranchController],
    providers: [BranchService],
})
export class BranchModule {}
