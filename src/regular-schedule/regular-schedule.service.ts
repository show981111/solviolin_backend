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

    async migrateRegular(file: Express.Multer.File, termID: number, nextTermID: number) {
        if (!file) throw new BadRequestException('file is empty');
        var obj = JSON.parse(file.buffer.toString());
        // var obj = JSON.parse(
        //     fs.readFileSync('/Users/yongseunglee/solviolin/migration/REGULARSCHEDULE.json', 'utf8'),
        // );
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

        const termInfo: Term[] = await getConnection()
            .createQueryBuilder()
            .select('term')
            .from(Term, 'term')
            .where('term.id = :termID || term.id = :nextTermID', {
                termID: termID,
                nextTermID: nextTermID,
            })
            .orderBy('term.id', 'ASC')
            .getMany();

        console.log(termInfo);

        if (termInfo.length != 2) throw new BadRequestException('term is invalid');
        var newUserList: string[] = [];
        var newTeacherList: string[] = [];
        for (var i = 0; i < reservationData.length; i++) {
            reservationData[i].userID = reservationData[i].userID.replace(' ', '');
            reservationData[i].courseTeacher = reservationData[i].courseTeacher.replace(' ', '');
            if (reservationData[i].userID[reservationData[i].userID.length - 1] == 'T') {
                reservationData[i].userID = reservationData[i].userID.substring(
                    0,
                    reservationData[i].userID.length - 1,
                );
            }
            if (reservationData[i].startTime) {
                if (new Date(reservationData[i].startDate) > new Date(termInfo[1].termEnd)) {
                    continue;
                }

                var userflag = 0;
                for (var j = 0; j < users.length; j++) {
                    if (users[j].userID === reservationData[i].userID) {
                        userflag = 1;
                        break;
                    }
                }
                if (userflag === 0) {
                    newUserList.push(reservationData[i].userID);
                    //throw new BadRequestException('CANNOT FOUND ' + reservationData[i].userID);
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
                    newTeacherList.push(reservationData[i].courseTeacher);
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
                regular.endDate = termInfo[0].termEnd;
                if (new Date(regular.startDate) > new Date(regular.endDate)) {
                    regular.endDate = termInfo[1].termEnd;
                }

                if (regular.startDate >= regular.endDate) {
                    return regular;
                }

                regular.termID = termInfo[0].id;

                regularList.push(regular);
            }
        }
        if (newUserList.length > 0 || newTeacherList.length > 0) {
            console.log(
                'CANNOT FOUND ' + newUserList.toString() + '\n' + newTeacherList.toString(),
            );
            // throw new BadRequestException(
            //     'CANNOT FOUND ' + newUserList.toString() + '\n' + newTeacherList.toString(),
            // );
        }
        return this.regularScheduleRepository
            .createQueryBuilder()
            .insert()
            .values(regularList)
            .orIgnore()
            .execute();

        // insert(regularList);
    }
}
