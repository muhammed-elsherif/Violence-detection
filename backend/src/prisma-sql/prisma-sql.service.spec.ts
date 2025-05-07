import { Test, TestingModule } from '@nestjs/testing';
import { PrismaSqlService } from './prisma-sql.service';

describe('PrismaSqlService', () => {
  let service: PrismaSqlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaSqlService],
    }).compile();

    service = module.get<PrismaSqlService>(PrismaSqlService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
