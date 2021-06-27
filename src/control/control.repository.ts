import { Control } from 'src/entities/control.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(Control)
export class ControlRepository extends Repository<Control> {}
