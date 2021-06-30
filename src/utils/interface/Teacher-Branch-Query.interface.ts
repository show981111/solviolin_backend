import { Branch } from 'src/entities/branch.entity';
import { TeacherID } from 'src/entities/teacherID.entity';

export interface TeacherBranchQuery {
    branch?: Branch;
    teacher?: TeacherID;
}
