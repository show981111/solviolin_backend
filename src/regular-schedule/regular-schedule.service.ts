import { Injectable, NotFoundException } from '@nestjs/common';
import { RegularScheduleRepository } from './regular-schedule.repository';

@Injectable()
export class RegularScheduleService {
    constructor(
        private readonly regularScheduleRepository: RegularScheduleRepository,
    ) {}

    async getRegularSechduleByUser(
        userID: string,
        criterion: Date,
    ): Promise<any> {
        const res = await this.regularScheduleRepository
            .createQueryBuilder()
            .innerJoin('RegularSchedule.user', 'user')
            .addSelect(['user.userDuration', 'user.totalClassCount'])
            .where('FK_REGULARSCHEDULE_userID = :userID', { userID: userID })
            .andWhere('userDuration != 0')
            .andWhere('startDate <= :startDate', { startDate: criterion })
            .andWhere('endDate >= :startDate', { startDate: criterion })
            .getMany();

        if (res?.length > 0) {
            return res;
        } else throw new NotFoundException('regular schedule not found');
    }
}
