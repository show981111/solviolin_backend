import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegularSchedule } from 'src/entities/regularSchedule.entity';
import { UserRepository } from 'src/user/user.repository';
import { RegularScheduleController } from './regular-schedule.controller';
import { RegularScheduleRepository } from './regular-schedule.repository';
import { RegularScheduleService } from './regular-schedule.service';

@Module({
    imports: [TypeOrmModule.forFeature([RegularScheduleRepository])],
    controllers: [RegularScheduleController],
    providers: [RegularScheduleService],
    exports: [RegularScheduleService],
})
export class RegularScheduleModule {}
