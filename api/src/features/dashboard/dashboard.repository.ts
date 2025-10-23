import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Question } from './entities/question.entity';

@Injectable()
export class DashboardRepository {
  constructor(
    @InjectModel(Question.name) private questionModel: Model<Question>,
  ) {}

  async countTotalQuestions(): Promise<number> {
    return await this.questionModel.countDocuments();
  }
}
