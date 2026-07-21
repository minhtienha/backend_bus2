import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { string } from 'zod';

export type TopicFollowerDocument = TopicFollower & Document;

@Schema({ timestamps: true })
export class TopicFollower {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: true,
  })
  topicId!: mongoose.Types.ObjectId;

  @Prop({ required: true, type: String })
  deviceToken!: string;

  @Prop({
    type: string,
    required: false,
  })
  userId?: string;
}

export const TopicFollowerSchema = SchemaFactory.createForClass(TopicFollower);
TopicFollowerSchema.index({ topicId: 1, deviceToken: 1 }, { unique: true });
