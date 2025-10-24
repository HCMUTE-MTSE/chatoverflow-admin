import { IsString, IsBoolean, IsNotEmpty, MaxLength } from 'class-validator';

export class HideContentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string;

  @IsBoolean()
  sendEmail: boolean;
}
