import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { DefaultSchema } from '../common/default.schema.js';

export enum FeedbackCategory {
  LOST_AND_FOUND = 'LOST_AND_FOUND',
  COMPLAINT = 'COMPLAINT',
  SUGGESTION = 'SUGGESTION',
  OTHER = 'OTHER',
}

export enum FeedbackStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
}

export type FeedbackDocument = Feedback & mongoose.Document;

@Schema({ timestamps: true })
export class Feedback extends DefaultSchema {
  @Prop({
    required: true,
    type: String,
    enum: Object.values(FeedbackCategory),
    default: FeedbackCategory.SUGGESTION,
  })
  Category!: FeedbackCategory;

  @Prop({ required: true, type: String })
  Content!: string;

  @Prop({
    required: true,
    type: String,
    enum: Object.values(FeedbackStatus),
    default: FeedbackStatus.PENDING,
  })
  Status!: FeedbackStatus;

  @Prop({ type: Boolean, default: false })
  IsPublic!: boolean;
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);
