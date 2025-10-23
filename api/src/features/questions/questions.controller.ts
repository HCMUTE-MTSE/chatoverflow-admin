import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { GetQuestionsDto } from './dto/get-questions.dto';
import { PaginatedQuestionsResponseDto } from './dto/question-response.dto';
import { Question } from './entities/question.entity';
import { Answer } from './entities/answer.entity';
import { Reply } from './entities/reply.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { HideContentDto } from './dto/hide-content.dto';
import { EmailService } from '../../common/services/email.service';

@Controller('questions')
export class QuestionsController {
  constructor(
    private readonly questionsService: QuestionsService,
    private readonly emailService: EmailService,
  ) {}

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

  // Admin endpoints for hiding/unhiding content
  @Post(':id/hide')
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  async hideQuestion(
    @Param('id') id: string,
    @Body() hideContentDto: HideContentDto,
  ) {
    return this.questionsService.hideQuestion(id, hideContentDto);
  }

  @Post(':id/unhide')
  @Roles('admin')
  @UseGuards(JwtAuthGuard)
  async unhideQuestion(@Param('id') id: string) {
    return this.questionsService.unhideQuestion(id);
  }

  @Post('answers/:id/hide')
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  async hideAnswer(
    @Param('id') id: string,
    @Body() hideContentDto: HideContentDto,
  ) {
    return this.questionsService.hideAnswer(id, hideContentDto);
  }

  @Post('answers/:id/unhide')
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  async unhideAnswer(@Param('id') id: string) {
    return this.questionsService.unhideAnswer(id);
  }

  @Post('replies/:id/hide')
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  async hideReply(
    @Param('id') id: string,
    @Body() hideContentDto: HideContentDto,
  ) {
    return this.questionsService.hideReply(id, hideContentDto);
  }

  @Post('replies/:id/unhide')
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  async unhideReply(@Param('id') id: string) {
    return this.questionsService.unhideReply(id);
  }
}
