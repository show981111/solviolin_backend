import { INestApplication } from '@nestjs/common';
import AdminBro from 'admin-bro';
import * as AdminBroExpress from 'admin-bro-expressjs';
import { User } from 'src/entities/user.entity';
import { Database, Resource } from '@admin-bro/typeorm';
import { Branch } from 'src/entities/branch.entity';
import { CheckIn } from 'src/entities/check-in.entity';
import { Control } from 'src/entities/control.entity';
import { Ledger } from 'src/entities/ledger.entity';
import { Link } from 'src/entities/link.entity';
import { RegularSchedule } from 'src/entities/regularSchedule.entity';
import { Reservation } from 'src/entities/reservation.entity';
import { Teacher } from 'src/entities/teacher.entity';
import { TeacherID } from 'src/entities/teacherID.entity';
import { Term } from 'src/entities/term.entity';
import { Verification } from 'src/entities/verification.entity';
import { validate } from 'class-validator';

export async function setupAdminPanel(app: INestApplication): Promise<void> {
    Resource.validate = validate;
    AdminBro.registerAdapter({ Database, Resource });

    /** Create adminBro instance */
    const adminBro = new AdminBro({
        resources: [
            User,
            Branch,
            CheckIn,
            Control,
            Ledger,
            Link,
            RegularSchedule,
            Reservation,
            { resource: Teacher },
            TeacherID,
            Term,
            Verification,
        ], // Here we will put resources
        rootPath: '/admin', // Define path for the admin panel
    });

    /** Create router */
    const router = AdminBroExpress.buildRouter(adminBro);

    /** Bind routing */
    app.use(adminBro.options.rootPath, router);
}
