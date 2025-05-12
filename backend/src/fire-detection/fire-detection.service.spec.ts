import { Test, TestingModule } from '@nestjs/testing';
import { FireDetectionService } from './fire-detection.service';

describe('FireDetectionService', () => {
  let service: FireDetectionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FireDetectionService],
    }).compile();

    service = module.get<FireDetectionService>(FireDetectionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
