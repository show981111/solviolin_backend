import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
import { TermModule } from 'src/term/term.module';
import { TeacherIDRepository } from './teacherID.repository';

@Module({
    imports: [
        TypeOrmModule.forFeature([UserRepository]),
        TypeOrmModule.forFeature([TeacherIDRepository]),
        TermModule,
    ],
    providers: [UserService],
    controllers: [UserController],
    exports: [UserService], // needed to use the service in the other module
})
export class UserModule {}
