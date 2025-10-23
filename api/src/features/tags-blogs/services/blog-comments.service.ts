import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { plainToInstance } from 'class-transformer';
import { BlogComment } from '../entities/blog-comments.entity';
import { BlogCommentResponseDto } from '../dto/blog-comments.dto';
import { Types } from 'mongoose';

@Injectable()
export class BlogCommentsService {
  constructor(
    @InjectModel(BlogComment.name)
    private blogCommentModel: Model<BlogComment>,
  ) {}

  // Lấy tất cả comments của một blog với pagination
  async getCommentsByBlog(
    blogId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    totalItems: number;
    data: BlogCommentResponseDto[];
  }> {
    const comments = await this.blogCommentModel
      .find({ blog: blogId, isDeleted: false })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .exec();

    const totalComments = await this.blogCommentModel
      .countDocuments({ blog: blogId, isDeleted: false })
      .exec();

    return {
      totalItems: totalComments,
      data: comments.map((comment) =>
        plainToInstance(BlogCommentResponseDto, comment.toObject(), {
          excludeExtraneousValues: true,
        }),
      ),
    };
  }

  // Lấy total comments của một blog
  async getTotalCommentsByBlog(blogId: string): Promise<number> {
    return await this.blogCommentModel
      .countDocuments({ blog: new Types.ObjectId(blogId), isDeleted: false })
      .exec();
  }

  // Soft delete comment
  async deleteComment(commentId: string, userId: string): Promise<boolean> {
    const result = await this.blogCommentModel
      .updateOne(
        { _id: commentId, user: userId },
        { $set: { isDeleted: true } },
      )
      .exec();

    return result.modifiedCount === 1;
  }
  async deleteCommentsByBlogId(blogId: string): Promise<void> {
    await this.blogCommentModel
      .deleteMany({ blog: new Types.ObjectId(blogId) })
      .exec();
  }
}
