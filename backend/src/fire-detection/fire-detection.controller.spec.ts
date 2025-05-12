import { Test, TestingModule } from '@nestjs/testing';
import { FireDetectionController } from './fire-detection.controller';
import { FireDetectionService } from './fire-detection.service';

describe('FireDetectionController', () => {
  let controller: FireDetectionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FireDetectionController],
      providers: [FireDetectionService],
    }).compile();

    controller = module.get<FireDetectionController>(FireDetectionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
