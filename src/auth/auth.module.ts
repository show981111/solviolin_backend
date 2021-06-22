import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtConfigModule } from 'src/config/jwt/configuration.module';
import { JwtConfigService } from 'src/config/jwt/configuration.service';
import { JwtRefreshStategy } from 'src/auth/strategies/jwt-refresh.strategy';
@Module({
    imports: [
        JwtConfigModule,
        UserModule,
        PassportModule,
        JwtModule.register({}),
    ],
    providers: [AuthService, LocalStrategy, JwtStrategy, JwtRefreshStategy],
    controllers: [AuthController],
})
export class AuthModule {}
