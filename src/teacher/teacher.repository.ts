import { Teacher } from 'src/entities/teacher.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(Teacher)
export class TeacherRepository extends Repository<Teacher> {}
