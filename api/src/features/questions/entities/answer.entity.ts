import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Transform } from 'class-transformer';

export type AnswerDocument = Answer & Document;

@Schema({
  timestamps: true,
  collection: 'answers',
})
export class Answer {
  @Transform(({ value }) => value.toString())
  _id: Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'Question', required: true })
  question: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  upvotedBy: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  downvotedBy: Types.ObjectId[];

  @Prop({ default: false })
  isHidden: boolean;

  @Prop({ type: String, default: null })
  hideReason: string | null;

  @Prop({ type: Date, default: null })
  hiddenAt: Date | null;

  // Virtual fields
  createdAt: Date;
  updatedAt: Date;

  // Virtual for reply count (will be populated)
  replyCount?: number;
  upvoteCount?: number;
  downvoteCount?: number;
  netVotes?: number;
}

export const AnswerSchema = SchemaFactory.createForClass(Answer);

// Add virtual for reply count
AnswerSchema.virtual('replyCount', {
  ref: 'Reply',
  localField: '_id',
  foreignField: 'answer',
  count: true,
});

// Add virtual fields for vote counts
AnswerSchema.virtual('upvoteCount').get(function () {
  return this.upvotedBy ? this.upvotedBy.length : 0;
});

AnswerSchema.virtual('downvoteCount').get(function () {
  return this.downvotedBy ? this.downvotedBy.length : 0;
});

AnswerSchema.virtual('netVotes').get(function () {
  const upvotes = this.upvotedBy ? this.upvotedBy.length : 0;
  const downvotes = this.downvotedBy ? this.downvotedBy.length : 0;
  return upvotes - downvotes;
});

// Ensure virtual fields are included in JSON output
AnswerSchema.set('toJSON', { virtuals: true });
AnswerSchema.set('toObject', { virtuals: true });

// Add indexes for better performance
AnswerSchema.index({ question: 1 });
AnswerSchema.index({ user: 1 });
AnswerSchema.index({ createdAt: -1 });
AnswerSchema.index({ upvotedBy: 1 });
AnswerSchema.index({ downvotedBy: 1 });
