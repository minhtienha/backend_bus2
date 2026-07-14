import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  uid!: string;

  @Prop()
  email!: string;

  @Prop({ default: 'user' })
  role?: string;

  @Prop({ type: [String], default: [] })
  fcmTokens!: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
