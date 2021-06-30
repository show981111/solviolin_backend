import {
    PipeTransform,
    Injectable,
    ArgumentMetadata,
    NotFoundException,
    MethodNotAllowedException,
    BadRequestException,
} from '@nestjs/common';
import { Reservation } from 'src/entities/reservation.entity';
import { ReservationService } from '../reservation.service';

@Injectable()
export class CheckCancelBefore4h implements PipeTransform {
    constructor(private readonly reservationService: ReservationService) {}
    async transform(value: any, metadata: ArgumentMetadata) {
        value = await this.getCourseInfo(value);
        return value;
    }

    async getCourseInfo(id: number): Promise<Reservation> {
        const res = await this.reservationService.getCourseInfo(id);
        if (!res) throw new NotFoundException('reserved course not found');
        if (res.bookingStatus == 2 || res.bookingStatus == -2)
            throw new MethodNotAllowedException('course is already canceled');
        if (new Date(res.startDate.getTime() - 4 * 60000) < new Date())
            throw new BadRequestException('reservation is possible until before 4 hour');
        return res;
    }
}
