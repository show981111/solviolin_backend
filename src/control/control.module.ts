import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationRepository } from 'src/reservation/repositories/reservation.repository';
import { UserModule } from 'src/user/user.module';
import { ControlController } from './control.controller';
import { ControlRepository } from './control.repository';
import { ControlService } from './control.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([ControlRepository]),
        UserModule,
        TypeOrmModule.forFeature([ReservationRepository]),
    ],
    controllers: [ControlController],
    providers: [ControlService],
    exports: [ControlService],
})
export class ControlModule {}
