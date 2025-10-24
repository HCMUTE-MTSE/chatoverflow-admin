import { Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  IsUrl,
  ArrayNotEmpty,
} from 'class-validator';

export class UserBlogDto {
  @Expose()
  _id: string;

  @Expose()
  name: string;

  @Expose()
  avatar?: string;
}

export class CreateBlogDto {
  @IsString()
  title: string;

  // store HTML content
  @IsString()
  content_html: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsUrl()
  coverImage?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class UpdateBlogDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content_html?: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsUrl()
  coverImage?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class BlogResponseDto {
  @Expose()
  _id: string;
  @Expose()
  title: string;

  @Expose()
  slug: string;
  @Expose()
  content_html: string;
  @Expose()
  summary?: string;
  @Expose()
  coverImage?: string;
  @Expose()
  @Type(() => UserBlogDto)
  user: UserBlogDto;
  @Expose()
  upvotedBy?: string[];
  @Expose()
  downvotedBy?: string[];
  @Expose()
  tags?: string[];
  @Expose()
  isPublished: boolean;
  @Expose()
  createdAt: Date;
  @Expose()
  updatedAt: Date;

  @Expose()
  totalComments: number;
}
