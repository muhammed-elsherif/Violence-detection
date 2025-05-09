import { Body, Controller, Get, Post } from '@nestjs/common';
import { AiModelService } from './aimodel.service';
import { CreateModelDto } from './dto/create-model.dto';

@Controller('models')
export class AiModelController {
  constructor(private readonly modelService: AiModelService) {}

  @Get()
  async getModels() {
    return this.modelService.getAllModels();
  }

  @Post('/create-model')
  async createModel(@Body() body: CreateModelDto) {
    return this.modelService.createModel(body);
  }
}
