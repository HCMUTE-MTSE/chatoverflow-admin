import { IsBoolean, IsOptional } from 'class-validator';

export class UnbanUserDto {
  @IsBoolean()
  @IsOptional()
  sendEmail?: boolean = true;
}
