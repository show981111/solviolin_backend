import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Query,
    UseFilters,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation } from '@nestjs/swagger';
import { JwtAdminGuard } from 'src/auth/guards/jwt-admin.guard';
import { TypeOrmExceptionFilter } from 'src/utils/filters/typeOrmException.filter';
import { DeleteResult, InsertResult, UpdateResult } from 'typeorm';
import { CreateLedgerDto } from './dto/create-ledger.dto';
import { SearchLedgerDto } from './dto/search-ledger.dto';
import { LedgerService } from './ledger.service';

@Controller('ledger')
@UseFilters(TypeOrmExceptionFilter)
export class LedgerController {
    constructor(private readonly ledgerService: LedgerService) {}
    @Post()
    @UseGuards(JwtAdminGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: '해당 학기에 유저 매출 입력',
    })
    postLedger(@Body() createLedgerDto: CreateLedgerDto): Promise<InsertResult> {
        return this.ledgerService.createLedgerItem(createLedgerDto);
    }

    @Delete('/:id')
    @UseGuards(JwtAdminGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: '해당 아이디의 매출 삭제',
    })
    deleteLedger(@Param('id') id: number): Promise<DeleteResult> {
        return this.ledgerService.deleteLedgerItem(id);
    }

    @Get()
    @UseGuards(JwtAdminGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: '해당 학기에 지점 매출 확인',
    })
    getIncomeInfo(@Query() searchLedgerDto: SearchLedgerDto): Promise<number> {
        return this.ledgerService.getTotalIncome(searchLedgerDto);
    }
}
