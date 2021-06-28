import { Injectable, PreconditionFailedException } from '@nestjs/common';
import { Term } from 'src/entities/term.entity';
import { TermRepository } from './term.repository';

@Injectable()
export class TermService {
    constructor(private readonly termRepository: TermRepository) {}

    async getTerm(): Promise<Term[]> {
        const res = await this.termRepository.find({
            order: { termStart: 'DESC' },
        });
        if (res?.length > 0) return res;
        else throw new PreconditionFailedException('term should be registered');
    }
}
