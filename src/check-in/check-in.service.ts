import { Injectable } from '@nestjs/common';
import { CheckIn } from 'src/entities/check-in.entity';
import { InsertResult } from 'typeorm';
import { CheckInRepository } from './check-in.repository';
import { SearchCheckInDto } from './dto/search-check-in.dto';

@Injectable()
export class CheckInService {
    constructor(private readonly checkInRepository: CheckInRepository) {}

    async postCheckIn(branchCode: string, userID: string): Promise<InsertResult> {
        // strlen($userBranch) > 15 && substr($userBranch, 0, 15) == "85C1J2S3O4L5103"
        return await this.checkInRepository.insert({ userID: userID, branchName: branchCode });
    }

    async searchCheckIn(searchCheckInDto: SearchCheckInDto): Promise<CheckIn[]> {
        return await this.checkInRepository.find(searchCheckInDto.getFilter);
    }
}
