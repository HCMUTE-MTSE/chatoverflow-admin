import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DashboardRepository } from './dashboard.repository';
import {
  Question,
  QuestionSchema,
} from '../questions/entities/question.entity';
import { Blog, BlogSchema } from '../tags-blogs/entities/blogs.entity';
import { User, UserSchema } from '../auth/entities/user.entity';
import { Tag, TagSchema } from '../tags-blogs/entities/tags.entity';
import { Answer, AnswerSchema } from '../questions/entities/answer.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Question.name, schema: QuestionSchema },
      { name: Blog.name, schema: BlogSchema },
      { name: User.name, schema: UserSchema },
      { name: Tag.name, schema: TagSchema },
      { name: Answer.name, schema: AnswerSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService, DashboardRepository],
})
export class DashboardModule {}
