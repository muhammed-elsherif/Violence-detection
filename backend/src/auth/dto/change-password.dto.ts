import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  newPassword: string;

  @IsString()
  @IsOptional()
  @MinLength(6)
  @MaxLength(20)
  oldPassword: string;
}
