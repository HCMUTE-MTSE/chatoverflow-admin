import { Expose, Type } from 'class-transformer';
import { IsMongoId, IsOptional, IsString, MinLength } from 'class-validator';
import { UserBlogDto } from './blogs.dto';

export class CreateBlogCommentDto {
  @IsString()
  @MinLength(1)
  content: string;

  @IsMongoId()
  blog: string;
}

export class UpdateBlogCommentDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  content?: string;
}

export class BlogCommentResponseDto {
  @Expose()
  id: string;

  @Expose()
  content: string;

  @Expose()
  @Type(() => UserBlogDto)
  user: UserBlogDto;

  @Expose()
  blog: string;

  @Expose()
  upvotedBy?: string[];

  @Expose()
  downvotedBy?: string[];

  @Expose()
  upvoteCount?: number;

  @Expose()
  downvoteCount?: number;

  @Expose()
  isDeleted: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
