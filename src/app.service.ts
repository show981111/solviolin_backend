import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
    getHello(): string {
        return 'Hello World! Jenkins Is Working!';
    }
}
