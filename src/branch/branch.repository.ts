import { EntityRepository, Repository } from "typeorm";
import { Branch } from "../entities/branch.entity";

@EntityRepository(Branch)
export class BranchRepository extends Repository<Branch>{}