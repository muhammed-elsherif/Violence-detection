import { IsString, IsNumber, IsBoolean, IsOptional, IsObject } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  category: string;

  @IsNumber()
  price: number;

  @IsString()
  features: string;

  @IsString()
  requirements: string;

  @IsString()
  modelFile: string;

  @IsString()
  @IsOptional()
  demoVideo?: string;

  @IsString()
  @IsOptional()
  documentation?: string;

  @IsBoolean()
  isPublic: boolean;

  @IsObject()
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
}
