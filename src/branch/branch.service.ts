import { Injectable } from '@nestjs/common';
import { BranchRepository } from './branch.repository';

@Injectable()
export class BranchService {
    constructor(private readonly branchRepository: BranchRepository) {}

    async createBranch(branchName: string) {
        return await this.branchRepository.insert({ branchName: branchName });
    }
}
