import {
    ConflictException,
    Injectable,
    NotFoundException,
    PreconditionFailedException,
} from '@nestjs/common';
import { Term } from 'src/entities/term.entity';
import { InsertResult, LessThanOrEqual, MoreThan, MoreThanOrEqual, UpdateResult } from 'typeorm';
import { CreateTermDto } from './dto/create-term.dto';
import { TermRepository } from './term.repository';

@Injectable()
export class TermService {
    constructor(private readonly termRepository: TermRepository) {}

    async getTerm(before?: Date): Promise<Term[]> {
        // [curTerm, last Term], [before가 있는 term, 그 전 term]
        if (!before) before = new Date(new Date().getTime() + 9 * 60 * 60 * 1000); //today in KST
        const res = await this.termRepository.find({
            where: {
                termStart: LessThanOrEqual(before),
            },
            order: { termStart: 'DESC' },
            take: 2,
        });
        if (res?.length >= 2) return res;
        else throw new PreconditionFailedException('cur term and last term should be registered');
    }

    async getNextTerm(): Promise<Term[]> {
        //[curTerm, nextTerm]
        const res = await this.termRepository.find({
            where: {
                termEnd: MoreThanOrEqual(new Date(new Date().getTime() + 9 * 60 * 60 * 1000)),
            },
            order: { termEnd: 'ASC' },
            take: 2,
        });
        if (res?.length >= 2) return res;
        else throw new NotFoundException('next term is not registered');
    }

    async postTerm(createTermDto: CreateTermDto): Promise<InsertResult> {
        createTermDto.termStart.setUTCHours(0, 0, 0, 0);
        createTermDto.termEnd.setUTCHours(23, 55, 0, 0);
        const findConflict = await this.termRepository
            .createQueryBuilder()
            .where(
                ` (termStart <= :termStart AND :termStart <= termEnd) OR 
                                (termStart <= :termEnd AND :termEnd <= termEnd)`,
                {
                    termStart: createTermDto.termStart,
                    termEnd: createTermDto.termEnd,
                },
            )
            .getOne();
        if (findConflict) throw new ConflictException('term is conflict');

        return await this.termRepository.insert({
            termStart: createTermDto.termStart,
            termEnd: createTermDto.termEnd,
        });
    }

    async getAllTerm(take: number): Promise<Term[]> {
        return await this.termRepository.find({ order: { id: 'DESC' }, take: take });
    }

    async updateTerm(id: number, createTermDto: CreateTermDto): Promise<UpdateResult> {
        return await this.termRepository.update(id, {
            termStart: createTermDto.termStart,
            termEnd: createTermDto.termEnd,
        });
    }

    async getTermById(id: number): Promise<Term> {
        const res = await this.termRepository.findOne(id);
        if (!res) throw new NotFoundException('term not found');
        return res;
    }
}
