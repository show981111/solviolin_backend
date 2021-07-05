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
import { JwtAdminGuard } from 'src/auth/guards/jwt-admin.guard';
import { User } from 'src/entities/user.entity';
import { TypeOrmExceptionFilter } from 'src/utils/filters/typeOrmException.filter';
import { UpdateResultChecker } from 'src/utils/interceptors/updateResultChecker.interceptor';
import { UpdateResult } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { SearchUserDto } from './dto/search-user-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@Controller('user')
@UseFilters(TypeOrmExceptionFilter)
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post()
    @UseFilters(new TypeOrmExceptionFilter())
    create(@Body() userData: CreateUserDto) {
        return this.userService.create(userData);
    }

    @Patch('/:userID')
    @UseGuards(JwtAdminGuard)
    @UseInterceptors(UpdateResultChecker)
    update(@Param('userID') userID, updateUserDto: UpdateUserDto): Promise<UpdateResult> {
        return this.userService.updateInfo(userID, updateUserDto);
    }

    @Get()
    searchUser(@Query() searchUserDto: SearchUserDto): Promise<User[]> {
        return this.userService.searchUser(searchUserDto);
    }
}
