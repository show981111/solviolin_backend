import { Link } from 'src/entities/link.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(Link)
export class LinkRepository extends Repository<Link> {}
