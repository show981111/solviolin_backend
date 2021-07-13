import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { UserRepository } from './user.repository';

@Module({
    imports: [TypeOrmModule.forFeature([UserRepository])],
    providers: [UserService],
    controllers: [UserController],
    exports: [UserService], // needed to use the service in the other module
})
export class UserModule {}
