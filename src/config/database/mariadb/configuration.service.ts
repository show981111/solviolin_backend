import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
/**
 * Service dealing with app config based operations.
 * 
 * @class
 */
@Injectable()
export class MariaDBConfigService {
  constructor(private configService: ConfigService) {}
  
  public get host(): string {
    return this.configService.get<string>('mariaDB.host');
  }
  public get port(): number {
    return Number(this.configService.get<number>('mariaDB.port'));
  }
  get username(): string {
    return this.configService.get<string>('mariaDB.username');
  }
  get password(): string {
   return this.configService.get<string>('mariaDB.password');
  }
  get database(): string {
    return this.configService.get<string>('mariaDB.database');
   }
}