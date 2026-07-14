import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  uid!: string;

  @Prop()
  email!: string;

  @Prop()
  name!: string;

  @Prop({ default: 'USER' })
  role!: string;

  @Prop({ type: [String], default: [] })
  fcmTokens!: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
