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
    getConnection,
    LessThanOrEqual,
    MoreThanOrEqual,
    UpdateResult,
} from 'typeorm';
import { CreateRegularDto } from './dto/create-regular.dto';
import { RegularScheduleRepository } from './regular-schedule.repository';
import * as fs from 'fs';
import { UserRepository } from 'src/user/user.repository';
import { User } from 'src/entities/user.entity';

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

    async migrateRegular() {
        var obj = JSON.parse(
            fs.readFileSync('/Users/yongseunglee/solviolin/migration/REGULARSCHEDULE.json', 'utf8'),
        );
        var reservationData = obj[2].data;
        var regularList: RegularSchedule[] = [];

        const result: User[] = await getConnection()
            .createQueryBuilder()
            .select('user')
            .from(User, 'user')
            .where('user.userType = 1')
            .getMany();
        const users: User[] = await getConnection()
            .createQueryBuilder()
            .select('user')
            .from(User, 'user')
            .getMany();
        var c = 0,
            e = 0,
            f = 0,
            d = 0;
        for (var i = 0; i < reservationData.length; i++) {
            if (reservationData[i].startTime) {
                var userflag = 0;
                for (var j = 0; j < users.length; j++) {
                    if (users[j].userID === reservationData[i].userID) {
                        userflag = 1;
                        break;
                    }
                }
                if (userflag === 0) {
                    reservationData[i].userID = reservationData[i].userID.replace(' ', '');
                }
                if (
                    reservationData[i].userID === '김현희' ||
                    reservationData[i].userID === '김종호' ||
                    reservationData[i].userID === '박은미'
                )
                    continue;

                if (
                    reservationData[i].userID === '조정해' &&
                    reservationData[i].startTime === '14:00'
                ) {
                    c++;
                    if (c > 1) continue;
                }
                if (
                    reservationData[i].userID === '황인영T' &&
                    reservationData[i].startTime === '11:30'
                ) {
                    d++;
                    if (d > 1) continue;
                }
                if (
                    reservationData[i].userID === '김지우b' &&
                    reservationData[i].startTime === '17:00'
                ) {
                    e++;
                    if (e > 1) continue;
                }
                if (
                    reservationData[i].userID === '윤선민' &&
                    reservationData[i].startTime === '19:30'
                ) {
                    f++;
                    if (f > 1) continue;
                }

                var flag = 0;
                const regular = new RegularSchedule();
                for (var j = 0; j < result.length; j++) {
                    if (
                        result[j].userName === reservationData[i].courseTeacher &&
                        result[j].branchName === reservationData[i].courseBranch
                    ) {
                        regular.teacherID = result[j].userID;
                        flag = 1;
                        break;
                    }
                }
                if (flag === 0) {
                    console.log('CANNOT FOUND ' + reservationData[i].num);
                    return;
                }

                regular.userID = reservationData[i].userID;
                regular.branchName = reservationData[i].courseBranch;
                regular.startTime = reservationData[i].startTime;
                regular.endTime = reservationData[i].endTime;
                regular.dow = reservationData[i].dow;
                if (reservationData[i].startDate.length === 10) {
                    reservationData[i].startDate =
                        reservationData[i].startDate + ' ' + reservationData[i].startTime;
                }
                regular.startDate = reservationData[i].startDate;
                if (new Date(reservationData[i].startDate) >= new Date('2021-08-28 23:55:00')) {
                    regular.endDate = new Date('2021-10-02 23:55:00');
                } else {
                    regular.endDate = new Date('2021-08-28 23:55:00');
                }

                regular.termID = 3;
                regularList.push(regular);
            }
        }
        return this.regularScheduleRepository.insert(regularList);

        // insert(regularList);
    }
}
