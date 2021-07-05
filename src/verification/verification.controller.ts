import { Body, Controller, Get, Param, Patch, Post, UseFilters } from '@nestjs/common';
import { InsertResult, UpdateResult } from 'typeorm';
import { VerificationService } from './verification.service';
import { UpdateVerificationDto } from './dto/update-verification.dto';
import { TypeOrmExceptionFilter } from 'src/utils/filters/typeOrmException.filter';
@Controller('verification')
@UseFilters(TypeOrmExceptionFilter)
export class VerificationController {
    constructor(private readonly verificationService: VerificationService) {}

    @Post('/sms/:userID') // Post verification Code
    getVerificationCode(@Param('userID') userID: string) {
        return this.verificationService.sendSMS(userID);
    }

    @Patch()
    verifyUser(@Body() updateVerificationDto: UpdateVerificationDto): Promise<UpdateResult> {
        return this.verificationService.verifiyUser(
            updateVerificationDto.userID,
            updateVerificationDto.input,
        );
    }

    @Patch('/reset')
    resetPassword(@Body() updateVerificationDto: UpdateVerificationDto): Promise<UpdateResult> {
        return this.verificationService.resetPassword(
            updateVerificationDto.userID,
            updateVerificationDto.input,
        );
    }

    //Verify the code and post to verification database that user is verified
}
