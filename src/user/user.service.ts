import { Injectable, NotFoundException } from '@nestjs/common';
import { DeleteResult, InsertResult, UpdateResult } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { UserRepository } from './user.repository';
import { SearchUserDto } from './dto/search-user-query.dto';

@Injectable()
export class UserService {
    constructor(private usersRepository: UserRepository) {}

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
        return this.usersRepository.update(userID, updateUserDto.getBody());
    }

    async searchUser(searchUserDto: SearchUserDto): Promise<User[]> {
        return this.usersRepository.find(searchUserDto);
    }
}
