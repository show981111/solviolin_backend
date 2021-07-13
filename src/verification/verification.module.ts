import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NaverSensConfigModule } from 'src/config/naver-sens/configuration.module';
import { Verification } from 'src/entities/verification.entity';
import { UserModule } from 'src/user/user.module';
import { VerificationController } from './verification.controller';
import { VerificationRepository } from './verification.repository';
import { VerificationService } from './verification.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([VerificationRepository]),
        NaverSensConfigModule,
        UserModule,
    ],
    controllers: [VerificationController],
    providers: [VerificationService],
})
export class VerificationModule {}
