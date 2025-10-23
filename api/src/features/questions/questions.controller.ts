import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { GetQuestionsDto } from './dto/get-questions.dto';
import { PaginatedQuestionsResponseDto } from './dto/question-response.dto';
import { Question } from './entities/question.entity';
import { Answer } from './entities/answer.entity';
import { Reply } from './entities/reply.entity';
import { repl } from '@nestjs/core';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  async findAll(
    @Query(new ValidationPipe({ transform: true })) dto: GetQuestionsDto,
  ): Promise<PaginatedQuestionsResponseDto> {
    return this.questionsService.findAll(dto);
  }

  @Get('popular')
  async getPopular(@Query('limit') limit?: string): Promise<Question[]> {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.questionsService.getPopularQuestions(limitNum);
  }

  @Get('recent')
  async getRecent(@Query('limit') limit?: string): Promise<Question[]> {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.questionsService.getRecentQuestions(limitNum);
  }

  @Get('by-tag/:tag')
  async getByTag(
    @Param('tag') tag: string,
    @Query('limit') limit?: string,
  ): Promise<Question[]> {
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.questionsService.getQuestionsByTag(tag, limitNum);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Question> {
    return this.questionsService.findOne(id);
  }

  @Get(':id/details')
  async getQuestionWithDetails(
    @Param('id') id: string,
    @Query('includeReplies') includeReplies?: string,
  ) {
    const shouldIncludeReplies = includeReplies === 'true';
    return this.questionsService.getQuestionWithDetails(
      id,
      shouldIncludeReplies,
    );
  }

  @Post(':id/view')
  async incrementViews(@Param('id') id: string): Promise<Question> {
    return this.questionsService.incrementViews(id);
  }

  // Answer endpoints
  @Get(':id/answers')
  async getAnswersForQuestion(
    @Param('id') questionId: string,
  ): Promise<Answer[]> {
    return this.questionsService.getAnswersForQuestion(questionId);
  }

  @Get('answers/:answerId')
  async getAnswer(@Param('answerId') answerId: string): Promise<Answer> {
    return this.questionsService.getAnswerById(answerId);
  }

  // Reply endpoints
  @Get('answers/:answerId/replies')
  async getRepliesForAnswer(
    @Param('answerId') answerId: string,
  ): Promise<Reply[]> {
    return this.questionsService.getRepliesForAnswer(answerId);
  }

  @Get('replies/:replyId/nested')
  async getNestedReplies(@Param('replyId') replyId: string): Promise<Reply[]> {
    return this.questionsService.getNestedReplies(replyId);
  }

  @Get('replies/:replyId')
  async getReply(@Param('replyId') replyId: string): Promise<Reply> {
    return this.questionsService.getReplyById(replyId);
  }
}
