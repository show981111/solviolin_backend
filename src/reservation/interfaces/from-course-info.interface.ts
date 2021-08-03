import { Reservation } from 'src/entities/reservation.entity';

export interface fromCourseInfo {
    from: Reservation;
    isFromLast: Boolean;
    using: number;
    isToNull: number;
}
