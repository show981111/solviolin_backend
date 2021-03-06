import { Body, Controller, Get, Post, Req, UseFilters, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-access.guard';
import { CheckIn } from 'src/entities/check-in.entity';
import { TypeOrmExceptionFilter } from 'src/utils/filters/typeOrmException.filter';
import { InsertResult } from 'typeorm';
import { CheckInService } from './check-in.service';
import { CreateCheckInDto } from './dto/create-check-in.dto';
import { SearchCheckInDto } from './dto/search-check-in.dto';

@Controller('check-in')
@UseFilters(TypeOrmExceptionFilter)
@ApiTags('CheckIn API')
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

    @Post('/search')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Get Check-In',
    })
    searchCheckIn(@Body() searchCheckInDto: SearchCheckInDto): Promise<CheckIn[]> {
        return this.checkInService.searchCheckIn(searchCheckInDto);
    }
}
