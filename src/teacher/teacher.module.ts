import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Teacher } from 'src/entities/teacher.entity';
import { TeacherController } from './teacher.controller';
import { TeacherRepository } from './teacher.repository';
import { TeacherService } from './teacher.service';

@Module({
    imports: [TypeOrmModule.forFeature([TeacherRepository])],
    controllers: [TeacherController],
    providers: [TeacherService],
    exports: [TeacherService],
})
export class TeacherModule {}
