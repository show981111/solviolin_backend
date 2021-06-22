import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InsertResult, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) {}

    async create(createUserDto: CreateUserDto): Promise<InsertResult> {
        const user = new User();
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(
            createUserDto.userPassword,
            salt,
        );
        user.setUser(createUserDto, hashedPassword, salt);
        const res = await this.usersRepository.insert(user);
        return res;
    }

    findAll(): Promise<User[]> {
        return this.usersRepository.find();
    }

    async getUserByID(userID: string): Promise<User> {
        const user = await this.usersRepository.findOne(userID);
        if (!user) throw new NotFoundException('user is not found');
        return user;
    }

    async remove(id: string): Promise<void> {
        await this.usersRepository.delete(id);
    }

    async updateRefreshToken(userID: string, refreshToken: string) {
        return this.usersRepository.update(userID, {
            refreshToken: refreshToken,
        });
    }
}
