import { Controller, Post, Body, UseFilters } from '@nestjs/common';
import { TypeOrmExceptionFilter } from 'src/utils/filters/typeOrmException.filter';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post()
    @UseFilters(new TypeOrmExceptionFilter())
    create(@Body() userData: CreateUserDto) {
        return this.userService.create(userData);
    }
}
