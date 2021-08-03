import { Reservation } from 'src/entities/reservation.entity';

export interface fromToLink {
    from: Reservation;
    to: Reservation[];
    isCanceledFromLast: Boolean;
    residue: number;
}
