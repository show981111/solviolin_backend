import { EntityRepository, Repository } from 'typeorm';
import { TeacherID } from '../entities/teacherID.entity';

@EntityRepository(TeacherID)
export class TeacherIDRepository extends Repository<TeacherID> {}
