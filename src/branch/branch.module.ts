import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Branch } from 'src/entities/branch.entity';
import { BranchController } from './branch.controller';
import { BranchService } from './branch.service';

@Module({
    imports: [TypeOrmModule.forFeature([Branch])],
    controllers: [BranchController],
    providers: [BranchService],
})
export class BranchModule {}
