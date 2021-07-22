import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckInController } from './check-in.controller';
import { CheckInRepository } from './check-in.repository';
import { CheckInService } from './check-in.service';

@Module({
    imports: [TypeOrmModule.forFeature([CheckInRepository])],
    controllers: [CheckInController],
    providers: [CheckInService],
})
export class CheckInModule {}
