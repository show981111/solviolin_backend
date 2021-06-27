import { Injectable, NotFoundException } from '@nestjs/common';
import { Control } from 'src/entities/control.entity';
import { UserService } from 'src/user/user.service';
import { QueryTeacherBranchDto } from 'src/utils/query-teacher-branch.dto';
import { DeleteResult, InsertResult, UpdateResult } from 'typeorm';
import { ControlRepository } from './control.repository';
import { CreateControlDto } from './dto/create-control.dto';

@Injectable()
export class ControlService {
    constructor(
        private readonly controlRepository: ControlRepository,
        private readonly userService: UserService,
    ) {}

    async getControlByQuery(query: QueryTeacherBranchDto): Promise<any> {
        return await this.controlRepository.find(query.getQuery);
    }

    async createControl(createControlDto: CreateControlDto): Promise<any> {
        var controlList = [];
        if (createControlDto.teacherID === 'all') {
            const teacherList = await this.userService.getUserByTypeAndBranch(
                1,
                createControlDto.teacherBranch,
            );
            for (var i = 0; i < teacherList.length; i++) {
                createControlDto.teacherID = teacherList[i].userID;
                let control = new Control();
                control.setControl(createControlDto);
                controlList.push(control);
            }
        } else {
            let control = new Control();
            control.setControl(createControlDto);
            controlList.push(control);
        }

        return await this.controlRepository
            .createQueryBuilder()
            .insert()
            .values(controlList)
            .orUpdate({
                conflict_target: ['unique_row'],
                overwrite: ['status'],
            })
            .execute();
    }

    async deleteControl(id: number): Promise<DeleteResult> {
        const res = await this.controlRepository.delete(id);
        if (res.affected < 1) throw new NotFoundException('row not found');
        return res;
    }

    async updateControl(
        id: number,
        updateControlDto: CreateControlDto,
    ): Promise<UpdateResult> {
        let control = new Control();
        control.setControl(updateControlDto);
        return await this.controlRepository.update(id, control);
    }
}
