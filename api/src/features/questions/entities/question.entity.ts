import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Transform } from 'class-transformer';

export type QuestionDocument = Question & Document;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Question {
  @Transform(({ value }) => value.toString())
  _id: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: Date.now })
  askedTime: Date;

  @Prop({ default: 0 })
  views: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  upvotedBy: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  downvotedBy: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  // Virtual fields
  createdAt: Date;
  updatedAt: Date;

  // Virtual for answer count (will be populated)
  answerCount?: number;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);

// Add virtual for answer count
QuestionSchema.virtual('answerCount', {
  ref: 'Answer',
  localField: '_id',
  foreignField: 'question',
  count: true,
});

// Add text search index
QuestionSchema.index(
  {
    title: 'text',
    content: 'text',
    tags: 'text',
  },
  {
    weights: {
      title: 10,
      content: 5,
      tags: 3,
    },
  },
);

// Add other useful indexes
QuestionSchema.index({ user: 1 });
QuestionSchema.index({ askedTime: -1 });
QuestionSchema.index({ views: -1 });
QuestionSchema.index({ tags: 1 });
