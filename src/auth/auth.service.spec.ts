import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { JwtConfigModule } from 'src/config/jwt/configuration.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStategy } from './strategies/jwt-refresh.strategy';
import { JwtAdminStrategy } from './strategies/jwt-admin.strategy';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { UserRepository } from 'src/user/user.repository';

type MockType<T> = {
    [P in keyof T]?: jest.Mock<{}>;
};

const mockRepository = () => ({
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
});

describe('AuthService', () => {
    let service: AuthService;
    let UserRepository: MockType<UserRepository>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                TypeOrmModule.forFeature([User]),
                JwtConfigModule,
                // UserModule,
                PassportModule,
                JwtModule.register({}),
            ],
            providers: [
                AuthService,
                UserService,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockRepository,
                },
                LocalStrategy,
                JwtStrategy,
                JwtRefreshStategy,
                JwtAdminStrategy,
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        UserRepository = module.get(getRepositoryToken(User));
    });

    describe('validate user', () => {
        it('should validate user and return user info', () => {
            const res = service.validateUser('sleep', '1111');
            expect(res).toHaveProperty('userID');
        });
        it('should return null', () => {
            const res = service.validateUser('sleep', '1231');
            expect(res).toBeNull();
        });
    });
});
