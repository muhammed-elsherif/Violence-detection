import { IsString, IsEmail, IsOptional, IsArray } from 'class-validator';

export class CreateCustomerDto {
  @IsEmail()
  email: string;

  @IsString()
  fullName: string;

  @IsString()
  companyName: string;

  @IsString()
  companyType: string;

  @IsArray()
  @IsString({ each: true })
  purchasedModels: string[];

  @IsOptional()
  @IsString()
  contactNumber?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  industry?: string;
}
