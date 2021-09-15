import { Test, TestingModule } from '@nestjs/testing';
import { ConsoleLogger, INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Connection } from 'typeorm';

describe('AppController (e2e) - RESERVATION', () => {
    let app: INestApplication;
    let connection: Connection;
    let token: string;
    let freeCourseID: number;
    let insertedId: number;
    let freeCourseStartDate: Date;
    beforeAll(async () => {
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

        await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                userID: 'sleep1',
                userPassword: '1234',
            })
            .then((value) => {
                token = value.body.access_token;
            });
    });

    it('should return filtered reservation Array', async () => {
        return await request(app.getHttpServer())
            .post('/reservation/search')
            .send({
                branchName: '잠실',
                bookingStatus: [-3, -1, 0, 1, 3],
            })
            .expect(201)
            .then((value) => {
                for (var i = 0; i < value.body.length; i++) {
                    expect(value.body[i].branchName).toBe('잠실');
                    expect(value.body[i].bookingStatus).not.toBe(-2);
                    expect(value.body[i].bookingStatus).not.toBe(2);
                }
            });
    });

    it('admin reserve a free course', async () => {
        var startDate: Date = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
        //내일 미리 잡힌 수업이 있다면.... 크래쉬
        startDate.setMinutes(0);
        var endDate: Date = new Date(startDate.getTime() + 30 * 60 * 1000);
        const res = await request(app.getHttpServer())
            .post('/reservation/free')
            .set('Authorization', `Bearer ${token}`)
            .send({
                teacherID: 'teacher2',
                branchName: '잠실',
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                userID: 'sleep1',
            })
            .expect(201)
            .then((value) => {
                freeCourseID = value.body.raw.insertId;
            });
        return res;
    });

    it('user cancel a course', async () => {
        const res = await request(app.getHttpServer())
            .patch('/reservation/user/cancel/' + freeCourseID)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
        return res;
    });

    it('should book a makeUp reservation by user', async () => {
        var startDate: Date = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
        while (startDate.getDay() !== 3) {
            startDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
        }
        startDate.setHours(18, 0, 0, 0);
        var endDate: Date = new Date(startDate.getTime() + 30 * 60 * 1000);
        freeCourseStartDate = startDate;

        const res = await request(app.getHttpServer())
            .post('/reservation/user')
            .set('Authorization', `Bearer ${token}`)
            .send({
                teacherID: 'teacher2',
                branchName: '잠실',
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
            })
            .expect(201)
            .then((value) => {
                console.log('RESPONSE FROM BOOKING MAKEUP COURSE ', value.body);
                insertedId = value.body[0].raw.insertId;
            });
        console.log('INSERTED RESERVATION ', freeCourseID + ' ' + insertedId);

        return res;
    });

    it('should be time line conflict', async () => {
        var endDate: Date = new Date(freeCourseStartDate.getTime() + 30 * 60 * 1000);
        const res = await request(app.getHttpServer())
            .post('/reservation/free')
            .set('Authorization', `Bearer ${token}`)
            .send({
                teacherID: 'teacher2',
                branchName: '잠실',
                startDate: freeCourseStartDate.toISOString(),
                endDate: endDate.toISOString(),
                userID: 'sleep',
            })
            .expect(409);

        await request(app.getHttpServer())
            .delete('/reservation')
            .set('Authorization', `Bearer ${token}`)
            .send({
                ids: [freeCourseID, insertedId],
            });
        return res;
    });

    it('should be precondition fail due to "teacher unavailable"', async () => {
        var startDate: Date = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
        while (startDate.getDay() !== 3) {
            startDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
        }
        startDate.setHours(21, 0, 0, 0);
        var endDate: Date = new Date(startDate.getTime() + 30 * 60 * 1000);
        return await request(app.getHttpServer())
            .post('/reservation/user')
            .set('Authorization', `Bearer ${token}`)
            .send({
                teacherID: 'teacher2',
                branchName: '잠실',
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
            })
            .expect(412);
    });

    it('should be precondition fail due to "should cancel more courses"', async () => {
        var startDate: Date = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
        while (startDate.getDay() !== 3) {
            startDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
        }
        startDate.setUTCHours(17, 0, 0, 0);
        var endDate: Date = new Date(startDate.getTime() + 30 * 60 * 1000);

        return await request(app.getHttpServer())
            .post('/reservation/user')
            .set('Authorization', `Bearer ${token}`)
            .send({
                teacherID: 'teacher2',
                branchName: '잠실',
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
            })
            .expect(412);
    });

    it('should be bad request due to "cancel before 4h"', async () => {
        var startDate: Date = new Date();
        startDate.setMinutes(0);
        var endDate: Date = new Date(startDate.getTime() + 30 * 60 * 1000);
        return await request(app.getHttpServer())
            .post('/reservation/user')
            .set('Authorization', `Bearer ${token}`)
            .send({
                teacherID: 'teacher2',
                branchName: '잠실',
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
            })
            .expect(400);
    });

    afterAll(async () => {
        await app.close();
    });
});
