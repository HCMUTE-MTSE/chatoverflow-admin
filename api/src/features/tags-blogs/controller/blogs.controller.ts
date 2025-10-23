import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/features/auth/guards/jwt-auth.guard';
import { BlogsService } from '../services/blogs.service';
import { ApiResponseDto } from 'src/common/dto/api-response.dto';

@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  // Controller methods will be defined here in the future
  @Get()
  // @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getBlogs(@Param('page') page: number, @Param('limit') limit: number) {
    try {
      const { totalItems, data } = await this.blogsService.getBlogs(
        page || 1,
        limit || 10,
      );
      return ApiResponseDto.withPagination(
        'Blogs fetched successfully',
        data,
        page,
        limit,
        '/blogs',
        totalItems,
      );
    } catch (error) {
      return ApiResponseDto.error('Failed to fetch blogs');
    }
  }
  @Get(':id')
  // @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getBlogById(@Param('id') id: string) {
    try {
      const blog = await this.blogsService.getBlogById(id);
      if (!blog) {
        return ApiResponseDto.error('Blog not found');
      }
      return ApiResponseDto.success('Blog fetched successfully', blog);
    } catch (error) {
      return ApiResponseDto.error('Failed to fetch blog');
    }
  }
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async deleteBlog(@Param('id') id: string) {
    try {
      const deleted = await this.blogsService.deleteBlog(id);
      if (!deleted) {
        return ApiResponseDto.error('Blog not found or could not be deleted');
      }
      return ApiResponseDto.success('Blog deleted successfully');
    } catch (error) {
      return ApiResponseDto.error('Failed to delete blog');
    }
  }
  // Additional methods for handling blog-related requests can be added here
  // For example, methods for creating, updating, deleting blogs, etc.
  // This is a placeholder method to demonstrate the controller structure
}
