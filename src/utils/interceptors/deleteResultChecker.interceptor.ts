import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    NotFoundException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class DeleteResultChecker<DeleteResult>
    implements NestInterceptor<DeleteResult, DeleteResult>
{
    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<DeleteResult> {
        return next.handle().pipe(
            map((data) => {
                if (data.affected > 0) {
                    return data;
                } else {
                    throw new NotFoundException('row not found');
                }
            }),
        );
    }
}
