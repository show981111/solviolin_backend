import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    HttpException,
    HttpStatus,
    CallHandler,
    Inject,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Logger } from 'winston';

@Injectable()
export class HTTPLoggingInterceptor implements NestInterceptor {
    constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const now = Date.now();
        const request = context.switchToHttp().getRequest();

        const method = request.method;
        const url = request.originalUrl;
        return next.handle().pipe(
            tap(() => {
                const response = context.switchToHttp().getResponse();
                const delay = Date.now() - now;

                if (request?.body?.userPassword) request.body.userPassword = undefined;
                if (request?.body?.refreshToken) request.body.refreshToken = undefined;

                var message = `${response.statusCode} | [${method}] ${url} [Body] ${JSON.stringify(
                    request.body,
                )} [Params] ${JSON.stringify(request.params)} [Query] ${JSON.stringify(
                    request.query,
                )} [FROM] ${request.user?.userID} - ${delay}ms`;
                this.logger.info(message);
            }),
        );
    }
}
