import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAdminGuard } from 'src/auth/guards/jwt-admin.guard';
import { CreateTermDto } from './dto/create-term.dto';
import { TermService } from './term.service';

@Controller('term')
export class TermController {
    constructor(private readonly termService: TermService) {}
    @Post()
    @UseGuards(JwtAdminGuard)
    postTerm(@Body() createTermDto: CreateTermDto) {
        return this.termService.postTerm(createTermDto);
    }

    @Get()
    getAllTerm() {
        return this.termService.getAllTerm();
    }

    @Get('/cur')
    getCurAndNextTerm() {
        return this.termService.getNextTerm();
    }
}
