import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsObject,
} from "class-validator";
import { Transform } from "class-transformer";

export class CreateServiceDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  category: string;

  @IsNumber()
  @Transform(({ value }) => Number(value))
  price: number;

  @IsString()
  features: string;

  @IsString()
  requirements: string;

  @IsString()
  @IsOptional()
  demoVideo?: string;

  @IsString()
  @IsOptional()
  documentation?: string;

  @IsBoolean()
  @Transform(({ value }) => value === "true")
  isPublic: boolean;

  @IsString()
  endpoint: string;

  @IsObject()
  @Transform(({ value }) => {
    try {
      return typeof value === "string" ? JSON.parse(value) : value;
    } catch {
      return value;
    }
  })
  supportedPlatforms: {
    windows: boolean;
    macos: boolean;
    linux: boolean;
  };
}

export class CreateServiceRequestDto {
  @IsString()
  serviceName: string;

  @IsString()
  serviceDescription: string;

  @IsString()
  serviceCategory: string;

  @IsString()
  useCase: string;

  @IsString()
  @IsOptional()
  specificRequirements: string;

  @IsString()
  expectedTimeline: string;

  @IsNumber()
  @IsOptional()
  budget: number;
}
