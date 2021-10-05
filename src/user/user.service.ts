import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DeleteResult, getManager, InsertResult, Repository, UpdateResult } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { UserRepository } from './user.repository';
import { SearchUserDto } from './dto/search-user-query.dto';
import { TermService } from 'src/term/term.service';
import * as fs from 'fs';
import { TerminateTeacherDto } from './dto/terminate-teacher.dto';
import { TeacherID } from 'src/entities/teacherID.entity';
import { TeacherIDRepository } from './teacherID.repository';
import { Teacher } from 'src/entities/teacher.entity';

@Injectable()
export class UserService {
    constructor(
        private usersRepository: UserRepository,
        private termService: TermService,
        private teacherIDRepository: TeacherIDRepository,
    ) {}

    async create(createUserDto: CreateUserDto): Promise<InsertResult> {
        const user = new User();
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(createUserDto.userPassword, salt);
        user.setUser(createUserDto, hashedPassword, salt);
        const res = await this.usersRepository.insert(user);
        return res;
    }

    async updatePassword(userID: string, userPassword: string): Promise<UpdateResult> {
        const user = new User();
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(userPassword, salt);
        user.userID = userID;
        return await this.usersRepository.update(
            { userID: userID },
            { salt: salt, userPassword: hashedPassword },
        );
    }

    findAll(): Promise<User[]> {
        return this.usersRepository.find();
    }

    async getUserByID(userID: string): Promise<User> {
        const user = await this.usersRepository.findOne(userID);
        if (!user) throw new NotFoundException('user is not found');
        return user;
    }

    async remove(id: string): Promise<DeleteResult> {
        return await this.usersRepository.delete(id);
    }

    async updateRefreshToken(userID: string, refreshToken: string): Promise<UpdateResult> {
        return this.usersRepository.update(userID, {
            refreshToken: refreshToken,
        });
    }

    async getUserByTypeAndBranch(userType: number, branchName: string): Promise<User[]> {
        return this.usersRepository.find({
            userType: userType,
            branchName: branchName,
        });
    }

    async updateInfo(userID: string, updateUserDto: UpdateUserDto): Promise<UpdateResult> {
        if (updateUserDto.isEmpty()) throw new BadRequestException('Empty body');
        if (updateUserDto.color) {
            await this.teacherIDRepository.update(userID, { color: updateUserDto.color });
        }
        return this.usersRepository.update(userID, updateUserDto.getBody());
    }

    async searchUser(searchUserDto: SearchUserDto): Promise<User[]> {
        const termList = await this.termService.getTerm();

        const users = await this.usersRepository
            .createQueryBuilder()
            .select([
                'User.userID',
                'User.branchName',
                'User.userName',
                'User.userPhone',
                'User.userType',
                'User.userCredit',
                'User.status',
            ])
            .leftJoin('User.ledgers', 'ledgers', 'ledgers.FK_LEDGER_termID = :termID', {
                termID: termList[0].id,
            })
            .addSelect(['ledgers.paidAt', 'ledgers.amount'])
            .where(searchUserDto.getSqlString(), searchUserDto.getSqlParams())
            .getMany();

        return users;
    }

    async migrateUserDate(file: Express.Multer.File, branchName: string) {
        // var obj = JSON.parse(
        //     fs.readFileSync('/Users/yongseunglee/solviolin/migration/USER.json', 'utf8'),
        // );
        if (!file) throw new BadRequestException('file is empty');
        var obj = JSON.parse(file.buffer.toString());
        var userData = obj[2].data;
        const userList: User[] = [];
        console.log(userData.length);
        for (var i = 0; i < userData.length; i++) {
            if (branchName !== userData[i].userBranch) continue;

            if (userData[i].userID) {
                const user: User = new User();
                if (userData[i].userID[userData[i].userID.length - 1] == 'T') {
                    userData[i].userID = userData[i].userID.substring(
                        0,
                        userData[i].userID.length - 1,
                    );
                }
                user.userID = userData[i].userID;
                user.userName = userData[i].userName;
                var phone: string = userData[i].userPhone;
                phone = phone.replace('-', '');
                phone = phone.replace('-', '');
                user.userPhone = phone;
                user.userCredit = 2;
                user.status = 1;
                user.branchName = userData[i].userBranch;
                if (userData[i].userType === '학생') {
                    user.userType = 0;
                } else if (userData[i].userType === '강사') {
                    user.userType = 1;
                }
                const salt = await bcrypt.genSalt();
                const hashedPassword = await bcrypt.hash(userData[i].userPassword, salt);
                user.salt = salt;
                user.userPassword = hashedPassword;
                userList.push(user);
            }
        }

        console.log(userList.length);
        // return userList;
        return await this.usersRepository
            .createQueryBuilder()
            .insert()
            .values(userList)
            .orIgnore()
            .execute();
    }

    /**
     * 1. update status to 0 at user db
     * 2. delete all schedule for teacher
     */
    async terminateTeacher(
        terminateTeacherDto: TerminateTeacherDto,
    ): Promise<(UpdateResult | DeleteResult)[]> {
        var final = await getManager().transaction(async (transactionalEntityManager) => {
            var updateRes = await transactionalEntityManager
                .getRepository(User)
                .update({ userID: terminateTeacherDto.teacherID }, { status: 0 });
            if (updateRes?.affected <= 0) throw new NotFoundException('TeacherID Not Found');

            var updateRes1 = await transactionalEntityManager.getRepository(TeacherID).update(
                {
                    teacherID: terminateTeacherDto.teacherID,
                },
                { endDate: terminateTeacherDto.endDate },
            );

            var deleteRes = await transactionalEntityManager
                .getRepository(Teacher)
                .delete({ teacherID: terminateTeacherDto.teacherID });
            return [updateRes, updateRes1, deleteRes];
        });
        return final;
    }

    async initializeCredit(): Promise<UpdateResult> {
        return await this.usersRepository.update({ status: 1, userType: 0 }, { userCredit: 2 });
    }
}
