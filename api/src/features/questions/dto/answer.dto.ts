import { IsString, IsNotEmpty, IsOptional, IsMongoId } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateAnswerDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsMongoId()
  question: string;

  @IsMongoId()
  user: string;
}

export class UpdateAnswerDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  content?: string;
}

export class AnswerResponseDto {
  @Transform(({ value }) => value.toString())
  _id: string;

  content: string;

  @Transform(({ value }) => value.toString())
  question: string;

  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };

  upvotedBy: string[];
  downvotedBy: string[];

  createdAt: Date;
  updatedAt: Date;

  replyCount?: number;

  // Computed properties
  get upvoteCount(): number {
    return this.upvotedBy ? this.upvotedBy.length : 0;
  }

  get downvoteCount(): number {
    return this.downvotedBy ? this.downvotedBy.length : 0;
  }

  get netVotes(): number {
    return this.upvoteCount - this.downvoteCount;
  }
}
