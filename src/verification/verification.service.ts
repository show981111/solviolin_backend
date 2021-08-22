import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { VerificationRepository } from './verification.repository';
import * as crypto from 'crypto';
import { NaverSensConfigService } from 'src/config/naver-sens/configuration.service';
import axios from 'axios';
import { UserService } from 'src/user/user.service';
import { Verification } from 'src/entities/verification.entity';
import { InsertResult, UpdateResult } from 'typeorm';

@Injectable()
export class VerificationService {
    constructor(
        private readonly verificationRepositry: VerificationRepository,
        private readonly naverSensConfigService: NaverSensConfigService,
        private readonly userService: UserService,
    ) {}

    private makeSignature(): string {
        const message = [];
        const hmac = crypto.createHmac('sha256', this.naverSensConfigService.secretKey);
        const space = ' ';
        const newLine = '\n';
        const method = 'POST';
        const timestamp = Date.now().toString();
        message.push(method);
        message.push(space);
        message.push(`/sms/v2/services/${this.naverSensConfigService.serviceID}/messages`);
        message.push(newLine);
        message.push(timestamp);
        message.push(newLine);
        message.push(this.naverSensConfigService.accessKey);
        const signature = hmac.update(message.join('')).digest('base64');
        return signature.toString(); // toString()이 없었어서 에러가 자꾸 났었는데, 반드시 고쳐야함.
    }

    async sendSMS(userID: string): Promise<any> {
        const getUserPhoneNumber = await this.userService.getUserByID(userID);
        const sixdigitsrandom = Math.floor(100000 + Math.random() * 900000);
        const body = {
            type: 'SMS',
            contentType: 'COMM',
            countryCode: '82',
            from: this.naverSensConfigService.from, // 발신자 번호
            content: `인증코드는 ${sixdigitsrandom} 입니다.`,
            messages: [
                {
                    to: getUserPhoneNumber.userPhone, // 수신자 번호
                },
            ],
        };
        const options = {
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'x-ncp-iam-access-key': this.naverSensConfigService.accessKey,
                'x-ncp-apigw-timestamp': Date.now().toString(),
                'x-ncp-apigw-signature-v2': this.makeSignature(),
            },
        };
        var url = `https://sens.apigw.ntruss.com/sms/v2/services/${this.naverSensConfigService.serviceID}/messages`;
        axios
            .post(url, body, options)
            .then(async (res) => {
                let verificationInfo = new Verification();
                verificationInfo.userID = userID;
                verificationInfo.code = String(sixdigitsrandom);

                const insertOrUpdate = await this.verificationRepositry.save(verificationInfo);
                return insertOrUpdate;
            })
            .catch((err) => {
                console.error(err.response.data);
                throw new InternalServerErrorException('fail to send message');
            });
    }

    async verifiyUser(userID: string, input: string): Promise<UpdateResult> {
        const verifyInfo = await this.verificationRepositry.findOneOrFail({ userID: userID });

        if (
            new Date().valueOf() - verifyInfo.issuedAt.valueOf() < 1000 * 60 * 3 &&
            verifyInfo.code === input
        ) {
            const updateRes = await this.verificationRepositry.update(userID, {
                verifiedAt: new Date(),
            });
            return updateRes;
        } else {
            throw new UnauthorizedException('code is incorrect');
        }
    }

    async resetPassword(userID: string, password: string): Promise<UpdateResult> {
        const isVerified = await this.verificationRepositry.findOne({ userID: userID });
        if (!isVerified)
            throw new UnauthorizedException('should be verified before change password');
        if (new Date().valueOf() - isVerified.verifiedAt.valueOf() < 1000 * 60 * 3) {
            return await this.userService.updatePassword(userID, password);
        } else {
            throw new UnauthorizedException('verification timeout');
        }
    }
}
