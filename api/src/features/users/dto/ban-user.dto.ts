import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  MaxLength,
  IsNumber,
  Min,
} from 'class-validator';

export class BanUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string;

  @IsBoolean()
  @IsOptional()
  sendEmail?: boolean = true;

  @IsNumber()
  @IsOptional()
  @Min(0)
  banDuration?: number; // Số ngày ban (0 = permanent)
}
