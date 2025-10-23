import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DashboardRepository } from './dashboard.repository';
import { Question, QuestionSchema } from './entities/question.entity';
import { Blog, BlogSchema } from './entities/blog.entity';
import { User, UserSchema } from './entities/user.entity';
import { Tag, TagSchema } from './entities/tag.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Question.name, schema: QuestionSchema },
      { name: Blog.name, schema: BlogSchema },
      { name: User.name, schema: UserSchema },
      { name: Tag.name, schema: TagSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService, DashboardRepository],
})
export class DashboardModule {}
