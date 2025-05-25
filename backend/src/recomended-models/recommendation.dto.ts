/* eslint-disable prettier/prettier */
import { IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RecommendationDto {
  @ApiProperty({ example: "Salah for transportion" })
  @IsString()
  company_name: string;

  @ApiProperty({ example: "We are a big company in transportation and storing goods" })
  @IsString()
  use_case: string;
}
