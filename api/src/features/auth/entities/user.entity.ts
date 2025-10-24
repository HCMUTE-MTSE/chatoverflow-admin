import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcrypt';

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
  collection: 'users',
})
export class User {
  @Prop({ required: true })
  name: string;

  @Prop()
  nickName?: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: false, select: false })
  password: string;

  @Prop()
  avatar?: string;

  @Prop({ maxlength: 300 })
  bio?: string;

  @Prop()
  dateOfBirth?: Date;

  @Prop({
    type: {
      province: { type: String, maxlength: 100 },
      ward: { type: String, maxlength: 100 },
      street: { type: String, maxlength: 200 },
    },
    _id: false,
  })
  address?: {
    province?: string;
    ward?: string;
    street?: string;
  };

  @Prop({ enum: ['male', 'female', 'other'], default: 'other' })
  gender: string;

  @Prop({
    enum: ['active', 'inactive', 'banned', 'pending'],
    default: 'pending',
  })
  status: string;

  @Prop({
    enum: ['admin', 'user'],
    default: 'user',
  })
  role: string;

  @Prop()
  tempPasswordHash?: string;

  @Prop()
  banReason?: string;

  @Prop()
  bannedAt?: Date;

  @Prop()
  banExpiresAt?: Date; // Thời gian hết hạn ban (null = permanent)

  @Prop()
  unbannedAt?: Date;

  // Method to compare password (will be added to document)
  comparePassword?: (plain: string) => Promise<boolean>;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Add instance method for password comparison
UserSchema.methods.comparePassword = function (plain: string) {
  return bcrypt.compare(plain, this.password);
};
