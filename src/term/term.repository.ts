import { Term } from 'src/entities/term.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(Term)
export class TermRepository extends Repository<Term> {}
