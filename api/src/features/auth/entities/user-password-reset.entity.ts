import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserPasswordResetDocument = UserPasswordReset & Document;

@Schema({
  timestamps: true,
  collection: 'userverifications',
})
export class UserPasswordReset {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  otpHash: string;

  @Prop({ required: true })
  otpExpiresAt: Date;

  @Prop({ default: 0 })
  attempts: number;
}

export const UserPasswordResetSchema =
  SchemaFactory.createForClass(UserPasswordReset);
