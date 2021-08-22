import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Inject,
    Logger,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

/**
 * HTTP exception 을 받아서 처리합니다.
 * Client 에 전달할 예외처리를 표준화 할 수 있습니다.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) {}

    catch(exception: unknown, host: ArgumentsHost) {
        console.log(exception);
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();

        let message = (exception as any)?.response?.message;
        let error = (exception as any)?.response?.error;

        if (!message) message = exception?.toString();

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        if (request?.body?.userPassword) request.body.userPassword = undefined;
        if (request?.body?.refreshToken) request.body.refreshToken = undefined;

        var loggingMessage = `${status} | [${request.method}] ${
            request.originalUrl
        } [Body] ${JSON.stringify(request.body)} [Params] ${JSON.stringify(
            request.params,
        )} [Query] ${JSON.stringify(request.query)} [Message] ${message} [Error] ${error} [FROM] ${
            request.user?.userID
        }`;

        this.logger.error(loggingMessage);

        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            message: message,
            error: error,
            path: request.url,
        });
    }
}
