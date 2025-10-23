import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';
import { Question, QuestionSchema } from './entities/question.entity';
import { Answer, AnswerSchema } from './entities/answer.entity';
import { Reply, ReplySchema } from './entities/reply.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Question.name, schema: QuestionSchema },
      { name: Answer.name, schema: AnswerSchema },
      { name: Reply.name, schema: ReplySchema },
    ]),
  ],
  controllers: [QuestionsController],
  providers: [QuestionsService],
  exports: [QuestionsService, MongooseModule], // Export service for use in other modules
})
export class QuestionsModule {}
