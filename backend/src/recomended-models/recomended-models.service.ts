import { HttpService } from "@nestjs/axios";
import { Injectable, HttpException } from "@nestjs/common";
import { firstValueFrom } from "rxjs";
import { RecommendationDto } from "./recommendation.dto";

@Injectable()
export class RecomendedModelsService {
  constructor(private readonly httpService: HttpService) {}

  async fetchRecommendedModel(body: RecommendationDto): Promise<{ recommended_model: string }> {
    const apiUrl = process.env.RECOMMENDED_MODEL_API as string;

    try {
      const response = await firstValueFrom(
        this.httpService.post(apiUrl, body)
      );
      return response.data;
    } catch (e) {
      throw new HttpException(
        e.response?.data?.detail || e.message || "Error contacting recommendation service",
        e.response?.status || 500
      );
    }
  }
}
