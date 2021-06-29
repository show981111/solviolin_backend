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
export class UpdateResultChecker<UpdateResult>
    implements NestInterceptor<UpdateResult, UpdateResult>
{
    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<UpdateResult> {
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
