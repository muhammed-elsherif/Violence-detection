import { Controller, Get } from '@nestjs/common';
import { AiModelService } from './aimodel.service';

@Controller('models')
export class AiModelController {
  constructor(private readonly modelService: AiModelService) {}

  @Get()
  getModels() {
    return this.modelService.getAllModels();
  }
}
