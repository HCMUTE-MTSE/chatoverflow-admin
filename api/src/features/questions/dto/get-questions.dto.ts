import {
  IsOptional,
  IsNumber,
  IsString,
  IsArray,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export enum SortBy {
  CREATED_AT = 'createdAt',
  ASKED_TIME = 'askedTime',
  VIEWS = 'views',
  TITLE = 'title',
  UPVOTES = 'upvotes',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class GetQuestionsDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map((tag) => tag.trim());
    }
    return value;
  })
  tags?: string[];

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsEnum(SortBy)
  sortBy?: SortBy = SortBy.CREATED_AT;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true';
    }
    return value;
  })
  includeAnswerCount?: boolean = true;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true';
    }
    return value;
  })
  includeUser?: boolean = false;
}
