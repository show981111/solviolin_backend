import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { VerificationRepository } from './verification.repository';
import * as crypto from 'crypto';
import { NaverSensConfigService } from 'src/config/naver-sens/configuration.service';
import axios from 'axios';
import { UserService } from 'src/user/user.service';
import { Verification } from 'src/entities/verification.entity';
import { InsertResult, UpdateResult } from 'typeorm';
import { SendSMSDto } from './dto/send-sms.dto';

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

    async cafe24SMS(sendSMSDto: SendSMSDto): Promise<any> {
        sendSMSDto.from =
            sendSMSDto.from.substr(0, 3) +
            '-' +
            sendSMSDto.from.substr(3, 4) +
            '-' +
            sendSMSDto.from.substr(7);
        for (var i = 0; i < sendSMSDto.to.length; i++) {
            sendSMSDto.to[i] =
                sendSMSDto.to[i].substr(0, 3) +
                '-' +
                sendSMSDto.to[i].substr(3, 4) +
                '-' +
                sendSMSDto.to[i].substr(7);
        }
        var url = 'https://sslsms.cafe24.com/sms_sender.php';
        const body = {
            user_id: Buffer.from('solviolinsms', 'binary').toString('base64'),
            secure: Buffer.from('9bc1a3d93f86a56ccb179e117d214370', 'binary').toString('base64'),
            sphone1: Buffer.from(sendSMSDto.from, 'binary').toString('base64'),
            sphone2: Buffer.from(sendSMSDto.from, 'binary').toString('base64'),
            rphone: Buffer.from(sendSMSDto.to.toString(), 'binary').toString('base64'),
            msg: Buffer.from('test test', 'binary').toString('base64'),
            testflag: Buffer.from('Y', 'binary').toString('base64'),
        };
        var requestFrom: string = `${url}?user_id=${body.user_id}&secure=${body.secure}&sphone1=${body.sphone1}&sphone2=${body.sphone2}&rphone=${body.rphone}&msg=${body.msg}&=testflag=${body.testflag}`;
        console.log(requestFrom);
        await axios
            .post(requestFrom)
            .then(async (res) => {
                console.log(res);
                return res;
            })
            .catch((err) => {
                console.error(err);
                throw new InternalServerErrorException('fail to send message');
            });
    }
}
