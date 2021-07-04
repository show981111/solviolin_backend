import { Controller, Get, Post } from '@nestjs/common';
import { InsertResult } from 'typeorm';
import { VerificationService } from './verification.service';

@Controller('verification')
export class VerificationController {
    constructor(private readonly verificationService: VerificationService) {}

    @Get('/:userPhone') // Post verification Code
    getVerificationCode(userID: string) {}

    @Post('/:userID')
    verifyUser(userID: string): Promise<InsertResult> {}

    //Verify the code and post to verification database that user is verified
}
