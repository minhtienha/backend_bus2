import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { DefaultSchema } from '../common/default.schema';

export type TimetableDocument = Timetable & Document;

@Schema({ _id: false })
export class Time {
  @Prop({ required: true })
  startTime!: string;

  @Prop({ required: true })
  endTime!: string;

  @Prop({ required: true })
  interval!: number;
}

export const TimeSchema = SchemaFactory.createForClass(Time);

@Schema({ timestamps: true })
export class Timetable extends DefaultSchema {
  @Prop({ required: true, index: true })
  id!: number;

  @Prop({ required: true, index: true })
  var!: number;

  @Prop({ required: true, min: 1 })
  travelTime!: number;

  @Prop({ type: [TimeSchema], default: [] })
  schedule!: Time[];
}

export const TimetableSchema = SchemaFactory.createForClass(Timetable);

TimetableSchema.index({ id: 1, var: 1 }, { unique: true });
