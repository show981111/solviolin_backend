import { Body, Controller, Post, Req, UseFilters, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-access.guard';
import { TypeOrmExceptionFilter } from 'src/utils/filters/typeOrmException.filter';
import { InsertResult } from 'typeorm';
import { CheckInService } from './check-in.service';
import { CreateCheckInDto } from './dto/create-check-in.dto';

@Controller('check-in')
@UseFilters(TypeOrmExceptionFilter)
export class CheckInController {
    constructor(private readonly checkInService: CheckInService) {}
    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Post Check-In',
    })
    postCheckIn(@Body() createCheckInDto: CreateCheckInDto, @Req() req): Promise<InsertResult> {
        return this.checkInService.postCheckIn(
            createCheckInDto.branchCode.substr(15),
            req?.user?.userID,
        );
    }
}
