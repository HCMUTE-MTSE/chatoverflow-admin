import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

class Address {
  @Prop()
  province: string;

  @Prop()
  ward: string;

  @Prop()
  street: string;
}

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  nickName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  avatar: string;

  @Prop({ type: Date })
  dateOfBirth: Date;

  @Prop({ type: Address })
  address: Address;

  @Prop({ enum: ['male', 'female', 'other'] })
  gender: string;

  @Prop({ enum: ['active', 'inactive', 'banned'], default: 'active' })
  status: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
