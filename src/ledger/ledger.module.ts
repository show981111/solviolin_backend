import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { LedgerController } from './ledger.controller';
import { LedgerRepository } from './ledger.repository';
import { LedgerService } from './ledger.service';

@Module({
    imports: [TypeOrmModule.forFeature([LedgerRepository]), UserModule],
    controllers: [LedgerController],
    providers: [LedgerService],
})
export class LedgerModule {}
