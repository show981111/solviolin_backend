import { Test, TestingModule } from '@nestjs/testing';
import { RegularScheduleController } from './regular-schedule.controller';

describe('RegularScheduleController', () => {
  let controller: RegularScheduleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegularScheduleController],
    }).compile();

    controller = module.get<RegularScheduleController>(RegularScheduleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
