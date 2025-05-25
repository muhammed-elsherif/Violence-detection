/* eslint-disable prettier/prettier */
import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { RecomendedModelsController } from "./recomended-models.controller";
import { RecomendedModelsService } from "./recomended-models.service";

@Module({
  imports: [HttpModule],
  controllers: [RecomendedModelsController],
  providers: [RecomendedModelsService],
})
export class RecomendedModelsModule {}
