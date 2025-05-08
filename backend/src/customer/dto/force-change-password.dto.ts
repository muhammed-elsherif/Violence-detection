import { IsString, MinLength, MaxLength } from 'class-validator';

export class ForceChangePasswordDto {
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  newPassword: string;
}
