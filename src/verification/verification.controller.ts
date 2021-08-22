import { Body, Controller, Get, Param, Patch, Post, UseFilters } from '@nestjs/common';
import { InsertResult, UpdateResult } from 'typeorm';
import { VerificationService } from './verification.service';
import { UpdateVerificationDto } from './dto/update-verification.dto';
import { TypeOrmExceptionFilter } from 'src/utils/filters/typeOrmException.filter';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SendSMSDto } from './dto/send-sms.dto';
@Controller('verification')
@UseFilters(TypeOrmExceptionFilter)
@ApiTags('Verification API')
export class VerificationController {
    constructor(private readonly verificationService: VerificationService) {}

    @Post('/sms/:userID') // Post verification Code
    @ApiOperation({ summary: 'send verification code to the user' })
    getVerificationCode(@Param('userID') userID: string) {
        return this.verificationService.sendSMS(userID);
    }

    @Post('/sms') // Post verification Code
    @ApiOperation({ summary: 'send verification code to the user' })
    sendMessage(@Body() sendSMSDto: SendSMSDto) {
        return this.verificationService.cafe24SMS(sendSMSDto);
    }

    @Patch()
    @ApiOperation({ summary: 'verify user' })
    verifyUser(@Body() updateVerificationDto: UpdateVerificationDto): Promise<UpdateResult> {
        return this.verificationService.verifiyUser(
            updateVerificationDto.userID,
            updateVerificationDto.input,
        );
    }

    @Patch('/reset')
    @ApiOperation({ summary: 'reset password by user' })
    resetPassword(@Body() updateVerificationDto: UpdateVerificationDto): Promise<UpdateResult> {
        return this.verificationService.resetPassword(
            updateVerificationDto.userID,
            updateVerificationDto.input,
        );
    }

    //Verify the code and post to verification database that user is verified
}
