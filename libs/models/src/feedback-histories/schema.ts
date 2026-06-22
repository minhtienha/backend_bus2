import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { DefaultSchema } from '../common/default.schema.js';
import { FeedbackStatus } from '../feedbacks/schema.js';

export type FeedbackHistoryDocument = FeedbackHistory & Document;

@Schema({ timestamps: true })
export class FeedbackHistory extends DefaultSchema {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Feedback',
    required: true,
    index: true,
  })
  FeedbackId!: mongoose.Types.ObjectId;

  @Prop({
    required: true,
    type: String,
    enum: Object.values(FeedbackStatus),
  })
  Status!: FeedbackStatus;

  @Prop({ type: String })
  Note?: string;

  @Prop({ type: String, default: 'Đơn vị quản lý' })
  ActionBy!: string;
}

export const FeedbackHistorySchema =
  SchemaFactory.createForClass(FeedbackHistory);
