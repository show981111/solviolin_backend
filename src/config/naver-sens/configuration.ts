import { registerAs } from '@nestjs/config';

export default registerAs('naver-sens', () => ({
    naver_sens_serviceID: process.env.naver_sens_serviceID,
    naver_sens_API_secretKey: process.env.naver_sens_API_secretKey,
    naver_sens_API_accessKey: process.env.naver_sens_API_accessKey,
    naver_sens_from: process.env.naver_sens_from,
}));
