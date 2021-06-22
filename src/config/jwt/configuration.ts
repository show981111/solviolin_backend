import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
    access_key: process.env.jwt_access_key,
    access_expiration: process.env.jwt_access_expiration,
    refresh_key: process.env.jwt_refresh_key,
    refresh_expiration: process.env.jwt_refresh_expiration,
}));
