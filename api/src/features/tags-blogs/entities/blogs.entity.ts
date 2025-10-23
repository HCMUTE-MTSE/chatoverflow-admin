/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import slugify from 'slugify';
import { User } from 'src/features/auth/entities/user.entity';

@Schema({ timestamps: true })
export class Blog extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ unique: true, index: true })
  slug: string;

  @Prop({ required: true })
  content_html: string;

  @Prop()
  summary?: string;

  @Prop()
  coverImage?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId | User;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  upvotedBy: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  downvotedBy: Types.ObjectId[];

  @Prop({ type: [String] })
  tags: string[];

  @Prop({ default: true })
  isPublished: boolean;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

// 🔹 Middleware xử lý slug
BlogSchema.pre<Blog>('save', function (next) {
  if (this.isModified('title') || this.isNew) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

BlogSchema.pre('findOneAndUpdate', function (next) {
  const update: any = this.getUpdate();
  if (update.title) {
    update.slug = slugify(update.title, { lower: true, strict: true });
    this.setUpdate(update);
  }
  next();
});
