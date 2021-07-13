import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Control } from 'src/entities/control.entity';
import { ReservationRepository } from 'src/reservation/reservation.repository';
import { UserModule } from 'src/user/user.module';
import { ControlController } from './control.controller';
import { ControlRepository } from './control.repository';
import { ControlService } from './control.service';

@Module({
    imports: [TypeOrmModule.forFeature([ControlRepository]), UserModule],
    controllers: [ControlController],
    providers: [ControlService, ReservationRepository],
    exports: [ControlService],
})
export class ControlModule {}
