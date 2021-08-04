import {
    Controller,
    Post,
    Body,
    UseFilters,
    UseGuards,
    Patch,
    Param,
    Get,
    Query,
    UseInterceptors,
} from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAdminGuard } from 'src/auth/guards/jwt-admin.guard';
import { User } from 'src/entities/user.entity';
import { TypeOrmExceptionFilter } from 'src/utils/filters/typeOrmException.filter';
import { UpdateResultChecker } from 'src/utils/interceptors/updateResultChecker.interceptor';
import { UpdateResult } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SearchUserDto } from './dto/search-user-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@Controller('user')
@UseFilters(TypeOrmExceptionFilter)
@ApiTags('User API')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post()
    @UseGuards(JwtAdminGuard)
    @ApiBody({ description: 'create user', type: CreateUserDto })
    @ApiOperation({ summary: 'register user' })
    @ApiCreatedResponse({ description: 'user created' })
    @ApiConflictResponse({ description: 'userID or phoneNumber already exist' })
    create(@Body() userData: CreateUserDto) {
        return this.userService.create(userData);
    }

    @Patch('/:userID')
    @UseGuards(JwtAdminGuard)
    @UseInterceptors(UpdateResultChecker)
    @ApiOperation({ summary: 'update user information(only for admin)' })
    @ApiBody({ description: 'update user(only admin can do it)', type: UpdateUserDto })
    @ApiParam({ description: 'userID', type: 'string', name: 'userID' })
    @ApiBearerAuth()
    @ApiOkResponse({ description: 'user updated' })
    @ApiConflictResponse({ description: 'userID or phoneNumber already exist' })
    @ApiUnauthorizedResponse({ description: 'not admin or tokin is invalid' })
    update(@Param('userID') userID, @Body() updateUserDto: UpdateUserDto): Promise<UpdateResult> {
        return this.userService.updateInfo(userID, updateUserDto);
    }

    @Get()
    @ApiOperation({ summary: 'search user' })
    @ApiQuery({ description: 'search query', type: SearchUserDto })
    @ApiOkResponse({ description: 'search result', type: [User] })
    searchUser(@Query() searchUserDto: SearchUserDto): Promise<User[]> {
        return this.userService.searchUser(searchUserDto);
    }

    @Patch('/reset')
    @UseGuards(JwtAdminGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'reset Password by admin' })
    @UseInterceptors(UpdateResultChecker)
    @ApiNotFoundResponse()
    resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<UpdateResult> {
        return this.userService.updatePassword(
            resetPasswordDto.userID,
            resetPasswordDto.userPassword,
        );
    }
}
