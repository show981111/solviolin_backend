import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';
type MockType<T> = {
    [P in keyof T]?: jest.Mock<{}>;
};

const mockRepository = () => ({
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    find: jest.fn().mockResolvedValue(['hii']),
    findAll: jest.fn(),
});

describe('UserService', () => {
    let service: UserService;
    let userRepository: MockType<UserRepository>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserRepository,
                UserService,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockRepository(),
                },
            ],
        }).compile();

        service = module.get<UserService>(UserService);
        userRepository = module.get(getRepositoryToken(User));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('findAll', () => {
        const res = service.findAll();
        console.log(res);
        expect(res).toBeDefined();
    });
});
