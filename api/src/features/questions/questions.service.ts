import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Question, QuestionDocument } from './entities/question.entity';
import { Answer, AnswerDocument } from './entities/answer.entity';
import { Reply, ReplyDocument } from './entities/reply.entity';
import { GetQuestionsDto, SortBy, SortOrder } from './dto/get-questions.dto';
import { PaginatedQuestionsResponseDto } from './dto/question-response.dto';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectModel(Question.name)
    private questionModel: Model<QuestionDocument>,
    @InjectModel(Answer.name)
    private answerModel: Model<AnswerDocument>,
    @InjectModel(Reply.name)
    private replyModel: Model<ReplyDocument>,
  ) {}

  async findAll(dto: GetQuestionsDto): Promise<PaginatedQuestionsResponseDto> {
    const {
      page = 1,
      limit = 10,
      search,
      tags,
      userId,
      sortBy = SortBy.CREATED_AT,
      sortOrder = SortOrder.DESC,
      includeAnswerCount = true,
      includeUser = false,
    } = dto;

    // Build query
    const query: any = {};

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Filter by tags
    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
    }

    // Filter by user
    if (userId) {
      query.user = userId;
    }

    // Build sort object
    const sort: any = {};

    // Handle different sort fields
    switch (sortBy) {
      case SortBy.UPVOTES:
        // Sort by number of upvotes (length of upvotedBy array)
        sort['upvotedBy'] = sortOrder === SortOrder.ASC ? 1 : -1;
        break;
      case SortBy.VIEWS:
        sort.views = sortOrder === SortOrder.ASC ? 1 : -1;
        break;
      case SortBy.TITLE:
        sort.title = sortOrder === SortOrder.ASC ? 1 : -1;
        break;
      case SortBy.ASKED_TIME:
        sort.askedTime = sortOrder === SortOrder.ASC ? 1 : -1;
        break;
      default:
        sort.createdAt = sortOrder === SortOrder.ASC ? 1 : -1;
    }

    // If text search is used, also sort by text score
    if (search) {
      sort.score = { $meta: 'textScore' };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build aggregation pipeline for better performance with sorting by array length
    let pipeline: any[] = [];

    // Match stage
    if (Object.keys(query).length > 0) {
      pipeline.push({ $match: query });
    }

    // Add computed fields for sorting
    pipeline.push({
      $addFields: {
        upvoteCount: { $size: '$upvotedBy' },
        downvoteCount: { $size: '$downvotedBy' },
        netVotes: {
          $subtract: [{ $size: '$upvotedBy' }, { $size: '$downvotedBy' }],
        },
      },
    });

    // Sort stage
    if (sortBy === SortBy.UPVOTES) {
      const sortObj = { upvoteCount: sortOrder === SortOrder.ASC ? 1 : -1 };
      pipeline.push({ $sort: sortObj });
    } else {
      pipeline.push({ $sort: sort });
    }

    // Add lookup for user details if requested
    if (includeUser) {
      pipeline.push({
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userData',
          pipeline: [
            {
              $project: {
                name: 1,
                email: 1,
                avatar: 1,
                _id: 1,
              },
            },
          ],
        },
      });

      pipeline.push({
        $addFields: {
          user: { $arrayElemAt: ['$userData', 0] },
        },
      });

      pipeline.push({
        $project: {
          userData: 0, // Remove temporary field
        },
      });
    }

    // Add lookup for answer count if requested
    if (includeAnswerCount) {
      pipeline.push({
        $lookup: {
          from: 'answers', // MongoDB collection name (lowercase + plural)
          localField: '_id',
          foreignField: 'question',
          as: 'answers',
        },
      });

      pipeline.push({
        $addFields: {
          answerCount: { $size: '$answers' },
        },
      });

      pipeline.push({
        $project: {
          answers: 0, // Remove the answers array, keep only the count
        },
      });
    }

    // Get total count
    const countPipeline = [...pipeline];
    countPipeline.push({ $count: 'total' });

    const countResult = await this.questionModel.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    // Add pagination to main pipeline
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    // Execute query
    const questions = await this.questionModel.aggregate(pipeline);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      data: questions,
      total,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPrevPage,
    };
  }

  async findOne(id: string): Promise<Question> {
    const question = await this.questionModel
      .findById(id)
      .populate('user', 'name email avatar')
      .populate('answerCount')
      .exec();

    if (!question) {
      throw new NotFoundException(`Question with ID "${id}" not found`);
    }

    return question;
  }

  async incrementViews(id: string): Promise<Question> {
    const question = await this.questionModel.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true },
    );

    if (!question) {
      throw new NotFoundException(`Question with ID "${id}" not found`);
    }

    return question;
  }

  // Helper method to get popular questions
  async getPopularQuestions(limit: number = 10): Promise<Question[]> {
    return this.questionModel
      .find()
      .sort({ views: -1, upvotedBy: -1 })
      .limit(limit)
      .populate('user', 'name email avatar')
      .exec();
  }

  // Helper method to get recent questions
  async getRecentQuestions(limit: number = 10): Promise<Question[]> {
    return this.questionModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('user', 'name email avatar')
      .exec();
  }

  // Helper method to get questions by tag
  async getQuestionsByTag(
    tag: string,
    limit: number = 20,
  ): Promise<Question[]> {
    return this.questionModel
      .find({ tags: tag })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('user', 'name email avatar')
      .exec();
  }

  // Answer-related methods
  async getAnswersForQuestion(questionId: string): Promise<Answer[]> {
    console.log('Searching for answers with questionId:', questionId);
    const answers = await this.answerModel
      .find({ question: questionId })
      .sort({ createdAt: -1 })
      .populate('user', 'name email avatar')
      .populate('replyCount')
      .exec();
    console.log('Found answers:', answers.length);
    return answers;
  }

  async getAnswerById(answerId: string): Promise<Answer> {
    const answer = await this.answerModel
      .findById(answerId)
      .populate('user', 'name email avatar')
      .populate('question', 'title')
      .populate('replyCount')
      .exec();

    if (!answer) {
      throw new NotFoundException(`Answer with ID "${answerId}" not found`);
    }

    return answer;
  }

  // Reply-related methods
  async getRepliesForAnswer(answerId: string): Promise<Reply[]> {
    console.log('=== getRepliesForAnswer Debug ===');
    console.log('Input answerId:', answerId);
    console.log('answerId type:', typeof answerId);

    // Convert to ObjectId
    const answerObjectId = new Types.ObjectId(answerId);
    console.log('Converted to ObjectId:', answerObjectId);

    // Check all replies in database
    const allReplies = await this.replyModel.find({}).exec();
    console.log('Total replies in database:', allReplies.length);
    console.log(
      'Sample replies:',
      allReplies.map((r) => ({
        _id: r._id,
        answer: r.answer,
        answerStr: r.answer.toString(),
        parent: r.parent,
        content: r.content.substring(0, 30) + '...',
      })),
    );

    const replies = await this.replyModel
      .find({
        answer: answerObjectId,
        parent: null,
      })
      .sort({ createdAt: -1 })
      .populate('user', 'name email avatar')
      .exec();

    console.log('Found replies for answer:', replies.length);
    console.log(
      'Query result:',
      replies.map((r) => ({
        _id: r._id,
        content: r.content.substring(0, 50) + '...',
        user: r.user,
      })),
    );

    return replies;
  }

  async getNestedReplies(parentReplyId: string): Promise<Reply[]> {
    console.log('Getting nested replies for parent ID:', parentReplyId);
    const nestedReplies = await this.replyModel
      .find({ parent: parentReplyId })
      .sort({ createdAt: 1 }) // Chronological order for nested replies
      .populate('user', 'name email avatar')
      .exec();
    console.log('Found nested replies count:', nestedReplies.length);
    return nestedReplies;
  }

  async getReplyById(replyId: string): Promise<Reply> {
    const reply = await this.replyModel
      .findById(replyId)
      .populate('user', 'name email avatar')
      .populate('answer', 'content')
      .populate('parent')
      .exec();

    if (!reply) {
      throw new NotFoundException(`Reply with ID "${replyId}" not found`);
    }

    return reply;
  }

  // Enhanced method to get question with full details including answers and replies
  async getQuestionWithDetails(
    id: string,
    includeReplies: boolean = false,
  ): Promise<Question & { answers?: (Answer & { replies?: Reply[] })[] }> {
    const question = await this.questionModel
      .findById(id)
      .populate('user', 'name email avatar')
      .exec();

    if (!question) {
      throw new NotFoundException(`Question with ID "${id}" not found`);
    }

    // Get answers - use question._id to ensure ObjectId format
    console.log('Getting answers for question ID:', id);
    console.log('Question _id from DB:', question._id);
    const answers = await this.answerModel
      .find({ question: question._id })
      .sort({ createdAt: -1 })
      .populate('user', 'name email avatar')
      .exec();
    console.log('Found answers count:', answers.length);

    // Get replies for each answer if requested
    if (includeReplies) {
      const answersWithReplies = await Promise.all(
        answers.map(async (answer) => {
          const replies = await this.getRepliesForAnswer(answer._id.toString());

          // Get nested replies for each top-level reply
          const repliesWithNested = await Promise.all(
            replies.map(async (reply) => {
              const nestedReplies = await this.getNestedReplies(
                reply._id.toString(),
              );
              return { ...(reply as ReplyDocument).toObject(), nestedReplies };
            }),
          );

          return { ...answer.toObject(), replies: repliesWithNested };
        }),
      );

      return { ...question.toObject(), answers: answersWithReplies };
    }

    return {
      ...question.toObject(),
      answers: answers.map((a) => a.toObject()),
    };
  }
}
