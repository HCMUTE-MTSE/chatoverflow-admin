import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Question } from './entities/question.entity';
import { Blog } from './entities/blog.entity';
import { User } from './entities/user.entity';
import { Tag } from './entities/tag.entity';

@Injectable()
export class DashboardRepository {
  constructor(
    @InjectModel(Question.name) private questionModel: Model<Question>,
    @InjectModel(Blog.name) private blogModel: Model<Blog>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Tag.name) private tagModel: Model<Tag>,
  ) {}

  async countTotalQuestions(): Promise<number> {
    return await this.questionModel.countDocuments();
  }

  async countTotalBlogs(): Promise<number> {
    return await this.blogModel.countDocuments();
  }

  async countTotalUsers(): Promise<number> {
    return await this.userModel.countDocuments();
  }

  async countTotalTags(): Promise<number> {
    return await this.tagModel.countDocuments();
  }
}
