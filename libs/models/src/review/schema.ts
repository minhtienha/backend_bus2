import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export type ReviewDocument = Review & mongoose.Document;

@Schema({ timestamps: true })
export class Review {
  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ required: true })
  userName!: string;

  @Prop({ required: true })
  email!: string;

  @Prop({ required: true, index: true })
  routeName!: string;

  @Prop({ required: true, min: 1, max: 5 })
  rating!: number;

  @Prop()
  licensePlate?: string;

  @Prop()
  comment?: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
