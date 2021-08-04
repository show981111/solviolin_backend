import { Ledger } from 'src/entities/ledger.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(Ledger)
export class LedgerRepository extends Repository<Ledger> {}
