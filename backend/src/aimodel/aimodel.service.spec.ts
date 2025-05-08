import { Test, TestingModule } from '@nestjs/testing';
import { AimodelService } from './aimodel.service';

describe('AimodelService', () => {
  let service: AimodelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AimodelService],
    }).compile();

    service = module.get<AimodelService>(AimodelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
