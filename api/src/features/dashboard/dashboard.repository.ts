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

  async getQuestionsByMonth() {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const questions = await this.questionModel.aggregate([
      {
        $match: {
          createdAt: { $gte: twelveMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          count: 1,
        },
      },
    ]);

    // Generate last 12 months array
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const result = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = months[date.getMonth()];
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      // eslint-disable-next-line
      const found = questions.find((q) => q.year === year && q.month === month);
      result.push({
        month: monthName,
        // eslint-disable-next-line
        count: found ? found.count : 0,
      });
    }

    // eslint-disable-next-line
    return result;
  }
}
