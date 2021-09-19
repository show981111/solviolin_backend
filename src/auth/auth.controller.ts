import { Controller, Post, UseGuards, Request, Get, UseFilters, Body, Patch } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { User } from 'src/entities/user.entity';
import { TypeOrmExceptionFilter } from 'src/utils/filters/typeOrmException.filter';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-access.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
@UseFilters(TypeOrmExceptionFilter)
@ApiTags('Auth API')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @UseGuards(LocalAuthGuard)
    @Post('/login')
    @ApiOperation({
        summary: '아이디 패스워드를 통한 로그인',
        description: '로그인 한 후 유저 정보와 access/refresh token 발급',
    })
    @ApiBody({
        description: 'userID and userPassword',
        type: LoginDto,
    })
    @ApiOkResponse({ description: '유저 정보 반환(유저 정보 + access/refresh token)', type: User })
    @ApiUnauthorizedResponse({ description: '아이디 패스워드 틀림' })
    @ApiNotFoundResponse({ description: '유저 존재하지 않음' })
    async login(@Body() loginDto: LoginDto, @Request() req) {
        const res = await this.authService.login(req.user);
        if (
            res?.userType == 2 ||
            res?.userType == 1 ||
            res?.userID === '이지민b' ||
            res?.userID === 'sleep1'
        )
            return res;
        else return;
    }

    @UseGuards(JwtAuthGuard)
    @Get('/profile')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'login using JWT' })
    @ApiOkResponse({ description: '유저 정보 반환(유저 정보 + access/refresh token)', type: User })
    @ApiUnauthorizedResponse({ description: 'token is invalid' })
    @ApiNotFoundResponse({ description: '유저 존재하지 않음' })
    getProfile(@Request() req) {
        return this.authService.getUserProfile(req?.user?.userID);
    }

    @UseGuards(JwtRefreshGuard)
    @Post('/refresh')
    @ApiBody({
        description: 'refreshToken',
    })
    @ApiOperation({ summary: 'get new access token using refresh token' })
    @ApiOkResponse({ description: 'issue new accesstoken' })
    @ApiUnauthorizedResponse({ description: 'token is invalid' })
    getRefreshToken(@Request() req) {
        return req.user;
    }

    @UseGuards(JwtAuthGuard)
    @Patch('/log-out')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'log out using JWT' })
    logOut(@Request() req) {
        return this.authService.getUserProfile(req?.user?.userID);
    }
}
