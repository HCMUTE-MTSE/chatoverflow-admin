import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Transform } from 'class-transformer';

export type ReplyDocument = Reply & Document;

@Schema({
  timestamps: true,
  collection: 'replies',
})
export class Reply {
  @Transform(({ value }) => value.toString())
  _id: Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'Answer', required: true })
  answer: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Reply', default: null })
  parent: Types.ObjectId | null;

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

  // Virtual for nested replies count
  nestedRepliesCount?: number;
  upvoteCount?: number;
  downvoteCount?: number;
  netVotes?: number;
}

export const ReplySchema = SchemaFactory.createForClass(Reply);

// Add virtual for nested replies count (replies to this reply)
ReplySchema.virtual('nestedRepliesCount', {
  ref: 'Reply',
  localField: '_id',
  foreignField: 'parent',
  count: true,
});

// Add virtual fields for vote counts
ReplySchema.virtual('upvoteCount').get(function () {
  return this.upvotedBy ? this.upvotedBy.length : 0;
});

ReplySchema.virtual('downvoteCount').get(function () {
  return this.downvotedBy ? this.downvotedBy.length : 0;
});

ReplySchema.virtual('netVotes').get(function () {
  const upvotes = this.upvotedBy ? this.upvotedBy.length : 0;
  const downvotes = this.downvotedBy ? this.downvotedBy.length : 0;
  return upvotes - downvotes;
});

// Ensure virtual fields are included in JSON output
ReplySchema.set('toJSON', { virtuals: true });
ReplySchema.set('toObject', { virtuals: true });

// Add indexes for better performance
ReplySchema.index({ answer: 1 });
ReplySchema.index({ parent: 1 });
ReplySchema.index({ user: 1 });
ReplySchema.index({ createdAt: -1 });
ReplySchema.index({ upvotedBy: 1 });
ReplySchema.index({ downvotedBy: 1 });
