import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NaverSensConfigModule } from 'src/config/naver-sens/configuration.module';
import { Verification } from 'src/entities/verification.entity';
import { VerificationController } from './verification.controller';
import { VerificationService } from './verification.service';

@Module({
    imports: [TypeOrmModule.forFeature([Verification]), NaverSensConfigModule],
    controllers: [VerificationController],
    providers: [VerificationService],
})
export class VerificationModule {}
