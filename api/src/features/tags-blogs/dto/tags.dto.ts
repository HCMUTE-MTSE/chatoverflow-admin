import { Expose } from 'class-transformer';
import { IsString, MinLength } from 'class-validator';

export class TagResponseDto {
  @Expose()
  _id: string;

  @Expose()
  name: string;
  @Expose()
  displayName: string;
  @Expose()
  questionCount: number;
  @Expose()
  description: string;

  @Expose()
  createdAt: Date;
  @Expose()
  updatedAt: Date;
}

export class CreateTagDto {
  @IsString()
  @MinLength(1)
  name: string;
  @IsString()
  @MinLength(1)
  displayName: string;
  @IsString()
  @MinLength(1)
  description: string;
}

export class UpdateTagDto {
  @IsString()
  @MinLength(1)
  displayName?: string;
  @IsString()
  @MinLength(1)
  description?: string;
}
