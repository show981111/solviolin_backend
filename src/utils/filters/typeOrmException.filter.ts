import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpStatus,
    Inject,
    Injectable,
    Logger,
} from '@nestjs/common';

import { Response } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { QueryFailedError, EntityNotFoundError, CannotCreateEntityIdMapError } from 'typeorm';

@Injectable()
@Catch(QueryFailedError, EntityNotFoundError, CannotCreateEntityIdMapError)
export class TypeOrmExceptionFilter implements ExceptionFilter {
    constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) {}

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest();

        let message = (exception as any).message.message;
        let code = (exception as any).code;
        let status = HttpStatus.UNPROCESSABLE_ENTITY;
        var sqlErrorCode, sqlMessage;

        switch (exception.constructor) {
            case QueryFailedError: // this is a TypeOrm error
                sqlMessage = (exception as QueryFailedError).message;
                message = sqlMessage;
                sqlErrorCode = (exception as any).errno;
                if (sqlErrorCode === 1452) {
                    // foreign key constraint fails
                    status = 400;
                    message = 'element is invalid or not found';
                    if (message.indexOf('branchName') !== -1) {
                        message = 'invalid branchName';
                    } else if (message.indexOf('userID') !== -1) {
                        message = 'user does not exist';
                    }
                } else if (sqlErrorCode === 1062) {
                    // conflict
                    status = 409;
                    message = 'element already exist or conflicted with other resources';
                    if (message.indexOf('user') !== -1) {
                        message = 'userID or userPhone already exist';
                    }
                } else if (sqlErrorCode === 4025) {
                    status = 400;
                    message = 'endDate should be after startDate';
                }
                break;
            case EntityNotFoundError: // this is another TypeOrm error
                status = 404;
                message = (exception as EntityNotFoundError).message;
                break;
            case CannotCreateEntityIdMapError: // and another
                message = (exception as CannotCreateEntityIdMapError).message;
                break;
        }

        if (request?.body?.userPassword) request.body.userPassword = undefined;
        if (request?.body?.refreshToken) request.body.refreshToken = undefined;

        var loggingMessage = `${status} | [${request.method}] ${
            request.originalUrl
        } [Body] ${JSON.stringify(request.body)} [Params] ${JSON.stringify(
            request.params,
        )} [Query] ${JSON.stringify(
            request.query,
        )} [Message] ${message} [SqlMessage] ${sqlMessage} [Code] ${code} [FROM] ${
            request.user?.userID
        }`;

        this.logger.error(loggingMessage);
        response.status(status).json({
            statusCode: status,
            message: message,
            sqlMessage: sqlMessage,
            code: code,
            path: request.url,
            method: request.method,
            timestamp: new Date().toISOString(),
        });
    }
}
