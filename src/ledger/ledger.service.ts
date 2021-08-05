import { Injectable } from '@nestjs/common';
import { Ledger } from 'src/entities/ledger.entity';
import { UserService } from 'src/user/user.service';
import { DeleteResult, InsertResult, UpdateResult } from 'typeorm';
import { CreateLedgerDto } from './dto/create-ledger.dto';
import { SearchLedgerItemDto } from './dto/search-ledger-item.dto';
import { SearchLedgerDto } from './dto/search-ledger.dto';
import { LedgerRepository } from './ledger.repository';

@Injectable()
export class LedgerService {
    constructor(
        private readonly ledgerRepository: LedgerRepository,
        private readonly userService: UserService,
    ) {}

    async createLedgerItem(createLedgerDto: CreateLedgerDto): Promise<InsertResult> {
        //
        const insertRes = await this.ledgerRepository.insert({
            userID: createLedgerDto.userID,
            termID: createLedgerDto.termID,
            amount: createLedgerDto.amount,
            branchName: createLedgerDto.branchName,
        });
        return insertRes;
    }

    async deleteLedgerItem(id: number): Promise<DeleteResult> {
        return await this.ledgerRepository.delete(id);
    }

    async getTotalIncome(searchLedgerDto: SearchLedgerDto): Promise<number> {
        const res = await this.ledgerRepository.find(searchLedgerDto);
        var total: number = 0;
        for (var i = 0; i < res?.length; i++) {
            total += res[i].amount;
        }
        return total;
    }

    async search(searchLedgerItemDto: SearchLedgerItemDto): Promise<Ledger[]> {
        return await this.ledgerRepository.find({ where: searchLedgerItemDto });
    }
}
