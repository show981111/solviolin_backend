import {
    Controller,
    Post,
    Body,
    BadRequestException,
    ConflictException,
    InternalServerErrorException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post()
    create(@Body() userData: CreateUserDto) {
        return this.userService.create(userData).catch((e) => {
            if (e.errno == 1452)
                throw new BadRequestException('invalid branchName');
            else if (e.errno == 1062)
                throw new ConflictException('userID or phone already exit');
            else throw new InternalServerErrorException();
        });
    }
}
