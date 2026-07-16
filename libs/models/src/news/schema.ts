import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type NewsDocument = News & Document;

@Schema({ _id: false })
class ContentStructure {
  @Prop()
  kind?: string;

  @Prop()
  url?: string;
}

@Schema({ timestamps: true })
export class News {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: true,
    index: true,
  })
  topicId!: mongoose.Types.ObjectId;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  subtitle!: string;

  @Prop({ required: true })
  content!: ContentStructure;

  @Prop()
  imageUrl?: string;
}

export const NewsSchema = SchemaFactory.createForClass(News);
