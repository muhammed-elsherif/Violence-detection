import { IsString, IsNotEmpty } from 'class-validator';

export class CreateServiceRequestDto {
  @IsString()
  @IsNotEmpty()
  serviceId: string;

  @IsString()
  @IsNotEmpty()
  customerId: string;
} 