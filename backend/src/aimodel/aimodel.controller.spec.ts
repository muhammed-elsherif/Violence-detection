import { Test, TestingModule } from '@nestjs/testing';
import { AimodelController } from './aimodel.controller';

describe('AimodelController', () => {
  let controller: AimodelController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AimodelController],
    }).compile();

    controller = module.get<AimodelController>(AimodelController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
