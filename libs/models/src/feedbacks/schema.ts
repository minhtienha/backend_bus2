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

export class GeoLocation {
  @Prop({ type: String, enum: ['Point'], default: 'Point' })
  type!: string;

  @Prop({ type: [Number], required: true })
  coordinates!: number[];

  @Prop({ type: String, required: true })
  address!: string;
}

export type FeedbackDocument = Feedback & mongoose.Document;

@Schema({ timestamps: true })
export class Feedback extends DefaultSchema {
  @Prop({ type: [String], default: [] })
  ImageUrls!: string[];

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

  @Prop({
    type: GeoLocation,
    required: true,
  })
  Location!: GeoLocation;

  @Prop({ type: String })
  FullName?: string;

  @Prop({ type: String })
  PhoneNumber?: string;

  @Prop({ type: String })
  Email?: string;

  @Prop({ type: Boolean, default: false })
  IsAnonymous!: boolean;
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);
