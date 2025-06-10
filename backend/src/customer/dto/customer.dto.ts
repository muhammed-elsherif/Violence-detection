import { IsString, IsEmail, IsOptional, IsArray } from 'class-validator';

export class CreateCustomerDto {
  @IsEmail()
  email: string;

  @IsString()
  contactName: string;

  @IsString()
  companyName: string;

  @IsArray()
  @IsString({ each: true })
  purchasedModels: string[];

  @IsString()
  industry: string;

  @IsString()
  contactNumber: string;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  country: string;

  @IsString()
  postalCode: string;

  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsString()
  building?: string;

  @IsOptional()
  @IsString()
  floor?: string;

  @IsOptional()
  @IsString()
  apartment?: string;
}
