import { Test, TestingModule } from '@nestjs/testing';
import { ConsoleLogger, INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Connection } from 'typeorm';

describe('AppController (e2e)', () => {
    let app: INestApplication;
    let connection: Connection;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .setLogger(new Logger())
            .compile();

        connection = moduleFixture.get(Connection);
        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true, // param 에 적은 타입으로 변환해줌.
            }),
        );
        await app.init();
    });

    it('/ test', async () => {
        return await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                userID: 'sleep1',
                userPassword: '1234',
            })
            .expect(201);
    });

    afterEach(async () => {
        await app.close();
    });
});
