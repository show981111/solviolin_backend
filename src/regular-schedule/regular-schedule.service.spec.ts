import { Test, TestingModule } from '@nestjs/testing';
import { RegularScheduleService } from './regular-schedule.service';

describe('RegularScheduleService', () => {
  let service: RegularScheduleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RegularScheduleService],
    }).compile();

    service = module.get<RegularScheduleService>(RegularScheduleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
