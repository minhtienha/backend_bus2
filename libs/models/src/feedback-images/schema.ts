import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { DefaultSchema } from '../common/default.schema.js';
import { Feedback } from '../feedbacks/schema.js';

export type FeedbackImageDocument = FeedbackImage & Document;

@Schema({ timestamps: true })
export class FeedbackImage extends DefaultSchema {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Feedback.name,
    required: true,
    index: true,
  })
  FeedbackId!: mongoose.Types.ObjectId;

  @Prop({
    required: true,
    type: String,
  })
  ImageUrl!: string;
}

export const FeedbackImageSchema = SchemaFactory.createForClass(FeedbackImage);
