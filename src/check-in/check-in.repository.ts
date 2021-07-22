import { CheckIn } from 'src/entities/check-in.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(CheckIn)
export class CheckInRepository extends Repository<CheckIn> {}
