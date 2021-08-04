import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseFilters,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAdminGuard } from 'src/auth/guards/jwt-admin.guard';
import { Term } from 'src/entities/term.entity';
import { TypeOrmExceptionFilter } from 'src/utils/filters/typeOrmException.filter';
import { CreateTermDto } from './dto/create-term.dto';
import { TermService } from './term.service';

@Controller('term')
@UseFilters(TypeOrmExceptionFilter)
@ApiTags('Term API')
export class TermController {
    constructor(private readonly termService: TermService) {}
    @Post()
    @UseGuards(JwtAdminGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: '학기 등록',
    })
    postTerm(@Body() createTermDto: CreateTermDto) {
        return this.termService.postTerm(createTermDto);
    }

    @Get()
    @ApiOperation({
        summary: '현재, 다음학기 조회 [현재, 다음학기 ]',
    })
    @ApiOkResponse({ type: [Term] })
    getCurAndNextTerm() {
        return this.termService.getNextTerm();
    }

    @Get('/:take')
    @ApiOperation({
        summary: '등록된 모든 학기 조회',
    })
    @ApiOkResponse({ type: [Term] })
    getAllTerm(@Param('take') take: number) {
        return this.termService.getAllTerm(take);
    }
}
