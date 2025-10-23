import { IsString, IsNotEmpty, IsOptional, IsMongoId } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateReplyDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsMongoId()
  answer: string;

  @IsOptional()
  @IsMongoId()
  parent?: string;

  @IsMongoId()
  user: string;
}

export class UpdateReplyDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  content?: string;
}

export class ReplyResponseDto {
  @Transform(({ value }) => value.toString())
  _id: string;

  content: string;

  @Transform(({ value }) => value.toString())
  answer: string;

  @Transform(({ value }) => value?.toString() || null)
  parent: string | null;

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

  nestedRepliesCount?: number;

  nestedReplies?: ReplyResponseDto[]; // For nested reply structure

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
