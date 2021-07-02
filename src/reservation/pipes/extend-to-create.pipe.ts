import {
    PipeTransform,
    Injectable,
    ArgumentMetadata,
    NotFoundException,
    MethodNotAllowedException,
} from '@nestjs/common';
import { Reservation } from 'src/entities/reservation.entity';
import { ReservationService } from '../services/reservation.service';

@Injectable()
export class IdToEntityTransform implements PipeTransform {
    constructor(private readonly reservationService: ReservationService) {}
    async transform(value: any, metadata: ArgumentMetadata) {
        value = await this.getCourseInfo(value);
        return value;
    }

    async getCourseInfo(id: number): Promise<Reservation> {
        const res = await this.reservationService.getCourseInfo(id);
        if (!res) throw new NotFoundException('reserved course not found');
        if (res.bookingStatus == 2 || res.bookingStatus == -2)
            throw new MethodNotAllowedException('canceled course cannot be extended');
        res.endDate = new Date(res.endDate.getTime() + 15 * 60000);
        return res;
    }
}
