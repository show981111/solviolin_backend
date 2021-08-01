import {
    PipeTransform,
    Injectable,
    ArgumentMetadata,
    PreconditionFailedException,
    BadRequestException,
} from '@nestjs/common';
import { ControlService } from 'src/control/control.service';
import { Branch } from 'src/entities/branch.entity';
import { TeacherID } from 'src/entities/teacherID.entity';
import { TeacherService } from 'src/teacher/teacher.service';
import { TeacherBranchQuery } from 'src/utils/interface/Teacher-Branch-Query.interface';

@Injectable()
export class ValidateReservationTime implements PipeTransform {
    constructor(
        private readonly teacherService: TeacherService,
        private readonly controlService: ControlService,
    ) {}
    async transform(input: any, metadata: ArgumentMetadata) {
        if (
            new Date(input.startDate.getTime() - 4 * 60000) <
            new Date(new Date().getTime() + 9 * 60 * 60 * 1000)
        ) {
            throw new BadRequestException('reservation is possible until before 4 hour');
        }
        const query: TeacherBranchQuery = {
            branch: new Branch(input.branchName),
            teacher: new TeacherID(input.teacherID),
        };
        const [isTimeAvailableForTeacher, isTimeOpened] = await Promise.all([
            this.isTimeAvailableForTeacher(query, input.startDate, input.endDate),
            this.isTimeOpened(input.branchName, input.teacherID, input.startDate, input.endDate),
        ]);

        if (!isTimeAvailableForTeacher && !isTimeOpened) {
            throw new PreconditionFailedException('timeslot is not available');
        } else {
            return input;
        }
    }

    private async isTimeAvailableForTeacher(
        query: TeacherBranchQuery,
        startDate: Date,
        endDate: Date,
    ): Promise<Boolean> {
        const teacherInfo = await this.teacherService.getWorkSlot(query, startDate, endDate);
        if (teacherInfo) return true;
        else return false;
    }

    private async isTimeOpened(
        branchName: string,
        teacherID: string,
        startDate: Date,
        endDate: Date,
    ): Promise<Boolean> {
        const overlapRes = await this.controlService.getOverlap(
            startDate,
            endDate,
            teacherID,
            branchName,
        );
        for (var i = 0; i < overlapRes.length; i++) {
            if (overlapRes[i].status === 1) {
                throw new PreconditionFailedException('timeslot is closed');
            } else {
                if (
                    overlapRes[i].controlStart <= startDate &&
                    endDate <= overlapRes[i].controlEnd
                ) {
                    return true;
                }
            }
        }
        return false; // not closed, not opened
    }
}
