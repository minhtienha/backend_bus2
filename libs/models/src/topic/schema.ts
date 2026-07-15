import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type TopicDocument = Topic & Document;

@Schema({ timestamps: true })
export class Topic {
  @Prop({ required: true })
  name!: string;

  @Prop()
  description?: string;
}

export const TopicSchema = SchemaFactory.createForClass(Topic);
