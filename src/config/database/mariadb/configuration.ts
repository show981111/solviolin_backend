import { registerAs } from '@nestjs/config';

export default registerAs('mariaDB', () => ({
    host: process.env.mariaDB_host,
    port: process.env.mariaDB_port,
    username: process.env.mariaDB_user,
    password: process.env.mariaDB_password,
    database: process.env.mariaDB_database,
}));