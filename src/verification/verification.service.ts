import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { VerificationRepository } from './verification.repository';
import * as crypto from 'crypto';
import { NaverSensConfigService } from 'src/config/naver-sens/configuration.service';
import axios from 'axios';

@Injectable()
export class VerificationService {
    constructor(private readonly verificationRepositry : VerificationRepository,
        private readonly naverSensConfigService : NaverSensConfigService){}


    private makeSignature() : string{
        const message = [];
        const hmac = crypto.createHmac('sha256', this.naverSensConfigService.secretKey);
        const space = ' ';
        const newLine = '\n';
        const method = 'POST';
        const timestamp = Date.now().toString();
        message.push(method);
        message.push(space);
        message.push(this.naverSensConfigService.serviceID);
        message.push(newLine);
        message.push(timestamp);
        message.push(newLine);
        message.push(this.naverSensConfigService.accessKey);
        const signature = hmac.update(message.join('')).digest('base64');
        return signature.toString(); // toString()이 없었어서 에러가 자꾸 났었는데, 반드시 고쳐야함.
    }

    async sendSMS(phoneNumber: string): Promise<string> {
        const body = {
            type: 'SMS',
            contentType: 'COMM',
            countryCode: '82',
            from: this.naverSensConfigService.from, // 발신자 번호
            content: `문자 내용 부분 입니다.`,
            messages: [
            {
                to: phoneNumber, // 수신자 번호
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
        var url = `https://sens.apigw.ntruss.com/sms/v2/services/${this.naverSensConfigService.serviceID}/messages`
        axios
            .post(url, body, options)
            .then(async (res) => {
            // 성공 이벤트
            })
            .catch((err) => {
            console.error(err.response.data);
            throw new InternalServerErrorException('fail to send message');
            });
    
        return authNumber;
        }
    }
}
