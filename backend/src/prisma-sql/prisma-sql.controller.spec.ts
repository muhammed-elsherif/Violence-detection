import { Test, TestingModule } from '@nestjs/testing';
import { PrismaSqlController } from './prisma-sql.controller';
import { PrismaSqlService } from './prisma-sql.service';

describe('PrismaSqlController', () => {
  let controller: PrismaSqlController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrismaSqlController],
      providers: [PrismaSqlService],
    }).compile();

    controller = module.get<PrismaSqlController>(PrismaSqlController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
