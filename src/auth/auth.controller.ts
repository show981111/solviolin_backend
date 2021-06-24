import {
    Controller,
    Post,
    UseGuards,
    Request,
    Get,
    BadRequestException,
    InternalServerErrorException,
    Body,
    UnauthorizedException,
    UseFilters,
} from '@nestjs/common';
import { TypeOrmExceptionFilter } from 'src/utils/typeOrmException.filter';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-access.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
@UseFilters(new TypeOrmExceptionFilter())
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @UseGuards(LocalAuthGuard)
    @Post('/login')
    async login(@Request() req) {
        return await this.authService.login(req.user);
    }

    @UseGuards(JwtAuthGuard)
    @Get('/profile')
    getProfile(@Request() req) {
        return this.authService.getUserProfile(req?.user?.userID);
    }

    @UseGuards(JwtRefreshGuard)
    @Post('/refresh')
    getRefreshToken(@Request() req) {
        return req.user;
    }
}
