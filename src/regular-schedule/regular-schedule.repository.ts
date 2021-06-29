import { RegularSchedule } from 'src/entities/regularSchedule.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(RegularSchedule)
export class RegularScheduleRepository extends Repository<RegularSchedule> {}
