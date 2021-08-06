import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { setupSwagger } from './utils/set-up-swagger';
import * as helmet from 'helmet';
import { setupAdminPanel } from './admin-panel/admin-panel.plugin';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // app.useGlobalInterceptors(new HTTPLoggingInterceptor());
    // app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true, // param 에 적은 타입으로 변환해줌.
        }),
    );

    app.use(helmet({ contentSecurityPolicy: false }));

    app.enableCors({
        origin: [/^(.*)/],
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        preflightContinue: false,
        credentials: true,
        optionsSuccessStatus: 204,
        allowedHeaders:
            'Origin,X-Requested-With,Content-Type,Accept,Authorization,authorization,X-Forwarded-for',
    });

    await setupAdminPanel(app);

    setupSwagger(app);

    await app.listen(3000);
}
bootstrap();
