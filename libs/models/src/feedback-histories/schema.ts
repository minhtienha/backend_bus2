import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { DefaultSchema } from '../common/default.schema.js';

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
    // type: mongoose.Schema.Types.ObjectId,
    // ref: 'User',
    required: false,
  })
  ActorId?: string;

  @Prop({
    required: true,
    type: String,
  })
  Message!: string;
}

export const FeedbackHistorySchema =
  SchemaFactory.createForClass(FeedbackHistory);
