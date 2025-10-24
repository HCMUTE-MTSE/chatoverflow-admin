import { Expose, Transform } from 'class-transformer';
import { AnswerResponseDto } from './answer.dto';

export class QuestionResponseDto {
  @Expose()
  @Transform(({ value }) => value.toString())
  _id: string;

  @Expose()
  title: string;

  @Expose()
  content: string;

  @Expose()
  tags: string[];

  @Expose()
  askedTime: Date;

  @Expose()
  views: number;

  @Expose()
  upvotedBy: string[];

  @Expose()
  downvotedBy: string[];

  @Expose()
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  answerCount?: number;

  @Expose()
  answers?: AnswerResponseDto[]; // Full answers data when requested

  // Computed properties
  @Expose()
  get upvoteCount(): number {
    return this.upvotedBy ? this.upvotedBy.length : 0;
  }

  @Expose()
  get downvoteCount(): number {
    return this.downvotedBy ? this.downvotedBy.length : 0;
  }

  @Expose()
  get netVotes(): number {
    return this.upvoteCount - this.downvoteCount;
  }
}

export class PaginatedQuestionsResponseDto {
  data: QuestionResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
