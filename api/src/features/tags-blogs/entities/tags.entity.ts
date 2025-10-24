import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TagDocument = Tag & Document;

@Schema({ timestamps: true })
export class Tag {
  @Prop({
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true,
  })
  name: string;

  @Prop({ type: String, required: true, trim: true })
  displayName: string;

  @Prop({ type: Number, default: 0 })
  questionCount: number;

  @Prop({ type: String, default: 'this is example description' })
  description: string;
}

export const TagSchema = SchemaFactory.createForClass(Tag);

// Create a descending index on questionCount for popularity sorting
TagSchema.index({ questionCount: -1 });

// Optionally export the model name constant used in modules
export const TAG_MODEL_NAME = Tag.name;
