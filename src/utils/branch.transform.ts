import { Branch } from 'src/entities/branch.entity';

export const transformBranch = (branch) => {
    if (branch) {
        return new Branch(branch);
    } else {
        return null;
    }
};
