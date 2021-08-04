import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TermController } from './term.controller';
import { TermRepository } from './term.repository';
import { TermService } from './term.service';

@Module({
    imports: [TypeOrmModule.forFeature([TermRepository])],
    controllers: [TermController],
    providers: [TermService],
    exports: [TermService],
})
export class TermModule {}
