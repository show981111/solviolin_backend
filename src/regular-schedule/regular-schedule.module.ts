import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegularSchedule } from 'src/entities/regularSchedule.entity';
import { RegularScheduleController } from './regular-schedule.controller';
import { RegularScheduleService } from './regular-schedule.service';

@Module({
    imports: [TypeOrmModule.forFeature([RegularSchedule])],
    controllers: [RegularScheduleController],
    providers: [RegularScheduleService],
    exports: [RegularScheduleService],
})
export class RegularScheduleModule {}
