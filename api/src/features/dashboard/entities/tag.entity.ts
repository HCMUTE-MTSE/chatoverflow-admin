import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Tag extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  displayName: string;

  @Prop()
  description: string;

  @Prop({ default: 0 })
  questionCount: number;
}

export const TagSchema = SchemaFactory.createForClass(Tag);
