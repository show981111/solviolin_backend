import { Injectable, NotFoundException } from '@nestjs/common';
import { Control } from 'src/entities/control.entity';
import { ReservationRepository } from 'src/reservation/reservation.repository';
import { UserService } from 'src/user/user.service';
import { TeacherBranchQuery } from 'src/utils/interface/Teacher-Branch-Query.interface';
import {
    DeleteResult,
    getManager,
    In,
    InsertResult,
    LessThanOrEqual,
    MoreThanOrEqual,
    UpdateResult,
} from 'typeorm';
import { ControlRepository } from './control.repository';
import { CreateControlDto } from './dto/create-control.dto';
import { ControlFilterDto } from './dto/search-control.dto';

@Injectable()
export class ControlService {
    constructor(
        private readonly controlRepository: ControlRepository,
        private readonly userService: UserService,
        private readonly reservationRepository: ReservationRepository,
    ) {}

    async getControlByFilter(filter: ControlFilterDto): Promise<Control[]> {
        return await this.controlRepository.find(filter.getFilter);
    }

    async getOverlap(
        startDate: Date,
        endDate: Date,
        teacherID: string,
        branchName: string,
    ): Promise<Control[]> {
        const res = await this.controlRepository
            .createQueryBuilder()
            .where(
                `FK_CONTROL_teacherID = :teacher AND FK_CONTROL_branch = :branch AND
                ( (controlStart <= :startDate AND :startDate < controlEnd) OR 
                    (controlStart < :endDate AND :endDate <= controlEnd)
                )`,
                {
                    teacher: teacherID,
                    branch: branchName,
                    startDate: startDate,
                    endDate: endDate,
                },
            )
            .getMany();
        return res;
    }

    async getControlByQuery(query: TeacherBranchQuery): Promise<Control[]> {
        return await this.controlRepository.find(query);
    }

    async createControl(createControlDto: CreateControlDto): Promise<InsertResult> {
        var controlList = [];
        var teachers = [createControlDto.teacherID];
        if (createControlDto.teacherID === 'all') {
            const teacherList = await this.userService.getUserByTypeAndBranch(
                1,
                createControlDto.branchName,
            );
            for (var i = 0; i < teacherList.length; i++) {
                createControlDto.teacherID = teacherList[i].userID;
                teachers.push(teacherList[i].userID);
                let control = new Control();
                control.setControl(createControlDto);
                controlList.push(control);
            }
        } else {
            let control = new Control();
            control.setControl(createControlDto);
            controlList.push(control);
        }
        var res;
        if (createControlDto.status === 1) {
            res = await getManager().transaction(async (transactionalEntityManager) => {
                await this.reservationRepository.update(
                    {
                        teacherID: In(teachers),
                        branchName: createControlDto.branchName,
                        startDate: MoreThanOrEqual(createControlDto.controlStart),
                        endDate: LessThanOrEqual(createControlDto.controlEnd),
                    },
                    { bookingStatus: -2 },
                );
                await this.controlRepository
                    .createQueryBuilder()
                    .insert()
                    .values(controlList)
                    .orUpdate({
                        conflict_target: ['unique_row'],
                        overwrite: ['status'],
                    })
                    .execute();
            });
        } else {
            res = await this.controlRepository
                .createQueryBuilder()
                .insert()
                .values(controlList)
                .orUpdate({
                    conflict_target: ['unique_row'],
                    overwrite: ['status'],
                })
                .execute();
        }

        return res;
    }

    async deleteControl(id: number): Promise<DeleteResult> {
        const res = await this.controlRepository.delete(id);
        if (res.affected < 1) throw new NotFoundException('row not found');
        return res;
    }

    async updateControl(id: number, updateControlDto: CreateControlDto): Promise<UpdateResult> {
        let control = new Control();
        control.setControl(updateControlDto);
        return await this.controlRepository.update(id, control);
    }

    async getControlContainsDate(
        teacherID: string,
        branchName: string,
        date: Date,
    ): Promise<Control[]> {
        const controlList = await this.controlRepository
            .createQueryBuilder()
            .where(
                `FK_CONTROL_teacherID = :teacherID AND FK_CONTROL_branch = :branchName 
                AND ( DATE(controlStart) <= :criterion AND :criterion <= DATE(controlEnd) )`,
                {
                    teacherID: teacherID,
                    branchName: branchName,
                    criterion: `${date.getUTCFullYear()}/${
                        date.getUTCMonth() + 1
                    }/${date.getUTCDate()}`,
                },
            )
            .orderBy('status', 'DESC')
            .getMany();
        return controlList;
    }
}
