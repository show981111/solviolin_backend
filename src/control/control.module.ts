import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Control } from 'src/entities/control.entity';
import { UserModule } from 'src/user/user.module';
import { ControlController } from './control.controller';
import { ControlService } from './control.service';

@Module({
    imports: [TypeOrmModule.forFeature([Control]), UserModule],
    controllers: [ControlController],
    providers: [ControlService],
    exports: [ControlService],
})
export class ControlModule {}
