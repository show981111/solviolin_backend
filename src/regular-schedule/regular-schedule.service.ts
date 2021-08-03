import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { RegularSchedule } from 'src/entities/regularSchedule.entity';
import { Term } from 'src/entities/term.entity';
import {
    DeleteResult,
    FindConditions,
    LessThanOrEqual,
    MoreThanOrEqual,
    UpdateResult,
} from 'typeorm';
import { CreateRegularDto } from './dto/create-regular.dto';
import { RegularScheduleRepository } from './regular-schedule.repository';

@Injectable()
export class RegularScheduleService {
    constructor(private readonly regularScheduleRepository: RegularScheduleRepository) {}

    async getRegularSechduleByUser(userID: string, criterion: Date): Promise<RegularSchedule[]> {
        // const res = await this.regularScheduleRepository
        //     .createQueryBuilder()
        //     .addSelect(`TIMEDIFF(startTime, endTime) as classDuration`)
        //     .where('FK_REGULARSCHEDULE_userID = :userID', { userID: userID })
        //     .andWhere('startDate <= :startDate', { startDate: criterion })
        //     .andWhere('endDate >= :startDate', { startDate: criterion })
        //     .getMany();
        const res = await this.regularScheduleRepository.find({
            where: {
                userID: userID,
                startDate: LessThanOrEqual(criterion),
                endDate: MoreThanOrEqual(criterion),
            },
            order: {
                startDate: 'DESC',
            },
        });
        if (res?.length > 0) {
            return res;
        } else throw new NotFoundException('regular schedule not found');
    }

    async postRegularService(createRegularDto: CreateRegularDto, termID: number): Promise<number> {
        const updatePastToNull = await this.regularScheduleRepository.update(
            {
                userID: createRegularDto.userID,
                termID: termID,
            },
            { termID: null },
        ); //termID 1개 에는 단 하나의 레귤러만 존재가능 : termID가 있는게 연장이 되는것.
        const regular = new RegularSchedule();
        regular.setRegularSchedule(createRegularDto);
        regular.termID = termID;
        const res = await this.regularScheduleRepository.insert(regular);
        if (res.raw.insertId) return res.raw.insertId;
        else throw new InternalServerErrorException('insertID is null');
    }

    async closeScheduleWithEndDate(id: number, endDate: Date): Promise<UpdateResult> {
        const res = await this.regularScheduleRepository.update(id, {
            endDate: endDate,
            termID: null, // close해버리면서 termID NULL 로 셋. 그러면 이 스케쥴은 연장이 안된다.
        });
        if (res.affected > 0) return res;
        else throw new NotFoundException('row not found');
    }

    async extendToNextTerm(
        condition: FindConditions<RegularSchedule>,
        nextTerm: Term,
    ): Promise<UpdateResult> {
        const extendTerm = await this.regularScheduleRepository.update(condition, {
            termID: nextTerm.id,
            endDate: nextTerm.termEnd,
        });
        return extendTerm;
    }

    async getExtendCandidates(
        condition: FindConditions<RegularSchedule>,
    ): Promise<RegularSchedule[]> {
        return await this.regularScheduleRepository.find(condition);
    }

    async updateTermFromTo(from: number, to: number): Promise<UpdateResult> {
        return await this.regularScheduleRepository.update({ termID: from }, { termID: to });
    }

    async deleteRegular(id: number): Promise<DeleteResult> {
        const regularInfo = await this.regularScheduleRepository.findOneOrFail(id);
        if (regularInfo.startDate < new Date(new Date().getTime() + 9 * 60 * 60 * 1000)) {
            throw new BadRequestException('cannot delete past regularSchedule');
        }

        return await this.regularScheduleRepository.delete(id);
    }
}
