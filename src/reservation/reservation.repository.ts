import { Reservation } from 'src/entities/reservation.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(Reservation)
export class ReservationRepository extends Repository<Reservation> {}
