import { Inject, Injectable } from '@nestjs/common';
import { CreateTagDto, TagResponseDto, UpdateTagDto } from '../dto/tags.dto';
import { Model } from 'mongoose';
import { Tag } from '../entities/tags.entity';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class TagsService {
  constructor(@Inject('TagModel') private tagModel: Model<Tag>) {}
  // Service methods for handling tag-related logic will be defined here in the future
  // This is a placeholder service to demonstrate the structure

  async getAllTags(
    page: number,
    limit: number,
  ): Promise<{ total: number; items: TagResponseDto[] }> {
    const tags = await this.tagModel
      .find()
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
    const total = await this.tagModel.countDocuments().exec();
    return {
      total,
      items: tags.map((tag) =>
        plainToInstance(
          TagResponseDto,
          {
            ...tag.toObject(),
            _id: tag._id.toString(),
            total,
          },
          {
            excludeExtraneousValues: true,
          },
        ),
      ),
    };
  }

  async getTagById(id: string): Promise<TagResponseDto | null> {
    const tag = await this.tagModel.findById(id).exec();
    if (!tag) return null;
    return plainToInstance(TagResponseDto, tag.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  async createTag(createTagDto: CreateTagDto): Promise<TagResponseDto> {
    const newTag = new this.tagModel(createTagDto);
    const savedTag = await newTag.save();
    return plainToInstance(TagResponseDto, savedTag.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  async updateTag(
    id: string,
    updateTagDto: Partial<UpdateTagDto>,
  ): Promise<TagResponseDto | null> {
    const updatedTag = await this.tagModel
      .findByIdAndUpdate(id, updateTagDto, { new: true })
      .exec();
    if (!updatedTag) return null;
    return plainToInstance(TagResponseDto, updatedTag.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  async deleteTag(id: string): Promise<boolean> {
    const result = await this.tagModel.deleteOne({ _id: id }).exec();
    return result.deletedCount > 0;
  }
}
