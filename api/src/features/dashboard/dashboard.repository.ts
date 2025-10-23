import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Question } from './entities/question.entity';
import { Blog } from './entities/blog.entity';
import { User } from './entities/user.entity';
import { Tag } from './entities/tag.entity';
import { Answer } from './entities/answer.entity';

@Injectable()
export class DashboardRepository {
  constructor(
    @InjectModel(Question.name) private questionModel: Model<Question>,
    @InjectModel(Blog.name) private blogModel: Model<Blog>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Tag.name) private tagModel: Model<Tag>,
    @InjectModel(Answer.name) private answerModel: Model<Answer>,
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

  async getTopUsers(limit: number = 10) {
    // eslint-disable-next-line
    return await this.answerModel.aggregate([
      {
        $project: {
          user: 1,
          totalVotes: {
            $subtract: [{ $size: '$upvotedBy' }, { $size: '$downvotedBy' }],
          },
        },
      },
      {
        $group: {
          _id: '$user',
          totalVotes: { $sum: '$totalVotes' },
        },
      },
      {
        $sort: { totalVotes: -1 },
      },
      {
        $limit: limit,
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      {
        $unwind: '$userInfo',
      },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          avatar: '$userInfo.avatar',
          name: '$userInfo.name',
          nickName: '$userInfo.nickName',
          totalVotes: 1,
        },
      },
    ]);
  }
}
