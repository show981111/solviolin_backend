import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Term } from 'src/entities/term.entity';
import { TermController } from './term.controller';
import { TermService } from './term.service';

@Module({
    imports: [TypeOrmModule.forFeature([Term])],
    controllers: [TermController],
    providers: [TermService],
    exports: [TermService],
})
export class TermModule {}
