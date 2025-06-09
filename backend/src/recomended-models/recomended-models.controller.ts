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
import { UserRole } from "@prisma/client";
import { Roles } from "src/auth/roles.decorator";
import { RolesGuard } from "src/auth/roles.guard";
@ApiTags("Model Recommendation")
@UseGuards(JwtAuthGuard)
@Controller("model-recommendation")
export class RecomendedModelsController {
  constructor(private readonly recomendedService: RecomendedModelsService) {}

  @Post()
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
  @Roles(UserRole.USER)
  @UseGuards(RolesGuard)
  async getModelRecommendation(@Body() body: RecommendationDto) {
    try {
      return await this.recomendedService.fetchRecommendedModel(body);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
}
