import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/features/auth/entities/user.entity';
import { Blog } from './blogs.entity';

@Schema({ timestamps: true })
export class BlogComment extends Document {
  @Prop({ required: true })
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId | User;

  @Prop({ type: Types.ObjectId, ref: 'Blog', required: true })
  blog: Types.ObjectId | Blog;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  upvotedBy: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  downvotedBy: Types.ObjectId[];

  @Prop({ default: false })
  isDeleted: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export const BlogCommentSchema = SchemaFactory.createForClass(BlogComment);

// Virtual field để lấy total upvotes và downvotes
BlogCommentSchema.virtual('upvoteCount').get(function () {
  return this.upvotedBy?.length || 0;
});

BlogCommentSchema.virtual('downvoteCount').get(function () {
  return this.downvotedBy?.length || 0;
});

// Ensure virtuals are included when converting to JSON
BlogCommentSchema.set('toJSON', { virtuals: true });
BlogCommentSchema.set('toObject', { virtuals: true });
