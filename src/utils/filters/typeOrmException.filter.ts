import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';

import { Request, Response } from 'express';
import { QueryFailedError, EntityNotFoundError, CannotCreateEntityIdMapError } from 'typeorm';

@Catch(QueryFailedError, EntityNotFoundError, CannotCreateEntityIdMapError)
export class TypeOrmExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let message = (exception as any).message.message;
        let code = (exception as any).code;
        let status = HttpStatus.UNPROCESSABLE_ENTITY;
        var sqlErrorCode, sqlMessage;

        Logger.error(message, (exception as any).stack, `${request.method} ${request.url}`);

        switch (exception.constructor) {
            case QueryFailedError: // this is a TypeOrm error
                sqlMessage = (exception as QueryFailedError).message;
                message = sqlMessage;
                sqlErrorCode = (exception as any).errno;
                if (sqlErrorCode === 1452) {
                    status = 400;
                    if (request.url === '/user') message = 'invalid branchName';
                } else if (sqlErrorCode === 1062) {
                    status = 409;
                    if (request.url === '/user') message = 'userID or userPhone already exist';
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

        response.status(status).json({
            statusCode: status,
            message: message,
            sqlMessage: sqlMessage,
            code: code,
            path: request.url,
            method: request.method,
        });
    }
}
