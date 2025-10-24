import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TagsService } from '../services/tags.service';
import { ApiResponseDto } from 'src/common/dto/api-response.dto';
import { CreateTagDto } from '../dto/tags.dto';
import { JwtAuthGuard } from 'src/features/auth/guards/jwt-auth.guard';

@Controller('tags')
export class TagsController {
  // Controller methods will be defined here in the future
  constructor(private readonly tagsService: TagsService) {}
  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.UNAUTHORIZED)
  async getTags(@Query('page') page: number, @Query('limit') limit: number) {
    const { total, items } = await this.tagsService.getAllTags(page, limit);
    return ApiResponseDto.withPagination(
      'Tags fetched successfully',
      items,
      page,
      limit,
      '/tags',
      total,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @HttpCode(HttpStatus.UNAUTHORIZED)
  async getTagById(@Param('id') id: string) {
    const tag = await this.tagsService.getTagById(id);
    if (!tag) {
      return ApiResponseDto.error('Tag not found');
    }
    return ApiResponseDto.success('Tag fetched successfully', tag);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.UNAUTHORIZED)
  async createTag(@Body() createTagDto: CreateTagDto) {
    const newTag = await this.tagsService.createTag(createTagDto);
    return ApiResponseDto.success('Tag created successfully', newTag);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @HttpCode(HttpStatus.UNAUTHORIZED)
  async updateTag(
    @Param('id') id: string,
    @Body() updateTagDto: Partial<CreateTagDto>,
  ) {
    const updatedTag = await this.tagsService.updateTag(id, updateTagDto);
    if (!updatedTag) {
      return ApiResponseDto.error('Tag not found or could not be updated');
    }
    return ApiResponseDto.success('Tag updated successfully', updatedTag);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @HttpCode(HttpStatus.UNAUTHORIZED)
  async deleteTag(@Param('id') id: string) {
    const deleted = await this.tagsService.deleteTag(id);
    if (!deleted) {
      return ApiResponseDto.error('Tag not found or could not be deleted');
    }
    return ApiResponseDto.success('Tag deleted successfully');
  }
}
