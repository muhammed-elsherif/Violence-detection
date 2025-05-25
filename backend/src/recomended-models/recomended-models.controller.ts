import {
  Controller,
  HttpException,
  Post,
  Body,
  UseGuards,
} from "@nestjs/common";
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RecomendedModelsService } from "./recomended-models.service";
import { RecommendationDto } from "./recommendation.dto";

@ApiTags("Model Recommendation")
@Controller("model-recommendation")
export class RecomendedModelsController {
  constructor(private readonly recomendedService: RecomendedModelsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Recommend a model based on use case and company name" })
  @ApiResponse({
    status: 200,
    description: "Successfully recommended a model",
    schema: {
      type: "object",
      properties: {
        recommended_model: {
          type: "string",
        },
      },
    },
  })
  @ApiResponse({ status: 500, description: "Internal server error during recommendation" })
  async getModelRecommendation(@Body() body: RecommendationDto) {
    try {
      return await this.recomendedService.fetchRecommendedModel(body);
    } catch (error) {
      throw new HttpException(
        error.message || "Error during recommendation",
        error.status || 500,
      );
    }
  }
}
