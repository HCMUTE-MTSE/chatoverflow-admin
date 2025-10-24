import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';
import { Question, QuestionSchema } from './entities/question.entity';
import { Answer, AnswerSchema } from './entities/answer.entity';
import { Reply, ReplySchema } from './entities/reply.entity';
import { AuthModule } from '../auth/auth.module';
import { EmailService } from '../../common/services/email.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Question.name, schema: QuestionSchema },
      { name: Answer.name, schema: AnswerSchema },
      { name: Reply.name, schema: ReplySchema },
    ]),
    AuthModule,
  ],

  controllers: [QuestionsController],
  providers: [QuestionsService, EmailService],
  exports: [QuestionsService, MongooseModule], // Export service for use in other modules
})
export class QuestionsModule {}
