import { Injectable } from '@nestjs/common';
import { Blog } from '../entities/blogs.entity';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BlogResponseDto } from '../dto/blogs.dto';
import { plainToInstance } from 'class-transformer';
import { BlogCommentsService } from './blog-comments.service';
@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name) private blogModel: Model<Blog>,
    private blogCommentsService: BlogCommentsService,
  ) {}
  // Service methods for handling blog-related logic will be defined here in the future
  // This is a placeholder service to demonstrate the structure
  async getBlogs(
    page: number,
    limit: number,
  ): Promise<{ totalItems: number; data: BlogResponseDto[] }> {
    const blogs = await this.blogModel
      .find()
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('user', 'name avatar')
      .exec();

    console.log('blogs:', blogs);

    const totalBlogs = await this.blogModel.countDocuments().exec();

    const data = await Promise.all(
      blogs.map(async (blog) => {
        const totalComments =
          await this.blogCommentsService.getTotalCommentsByBlog(
            blog._id.toString(),
          );

        const plain = blog.toObject(); // giữ nguyên ID gốc
        return plainToInstance(
          BlogResponseDto,
          {
            ...plain,
            _id: plain._id.toString(),
            totalComments,
          },
          { excludeExtraneousValues: true },
        );
      }),
    );

    return {
      totalItems: totalBlogs,
      data: data,
    };
  }

  async getBlogById(id: string): Promise<BlogResponseDto | null> {
    if (!Types.ObjectId.isValid(id)) {
      // Nếu id không hợp lệ (ví dụ người dùng nhập linh tinh)
      return null;
    }

    const objectId = new Types.ObjectId(id);

    const blog = await this.blogModel
      .findById(objectId)
      .populate('user', 'name avatar')
      .exec();

    if (!blog) {
      return null;
    }

    // ✅ Nếu bạn muốn thêm totalComments vào DTO:
    const totalComments = await this.blogCommentsService.getTotalCommentsByBlog(
      blog._id.toString(),
    );

    return plainToInstance(
      BlogResponseDto,
      {
        ...blog.toObject(),
        totalComments,
      },
      { excludeExtraneousValues: true },
    );
  }
  async deleteBlog(id: string): Promise<boolean> {
    const result = await this.blogModel.deleteOne({ _id: id }).exec();
    return result.deletedCount === 1;
  }
}
