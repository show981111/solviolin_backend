import { Verification } from 'src/entities/verification.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(Verification)
export class VerificationRepository extends Repository<Verification> {}
