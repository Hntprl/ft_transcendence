import { IsNotEmpty, IsString, Length } from 'class-validator';

export class TwoFactorLoginDto {
  @IsString()
  @IsNotEmpty()
  tempToken: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  code: string;
}
