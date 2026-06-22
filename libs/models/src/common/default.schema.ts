import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';
// import { User, UserDocument } from '../users/schema.js';

export class DefaultSchema {
  @Prop()
  tags?: string[];

  @Prop({ default: true })
  isPublic?: boolean;

  @Prop({ default: [] })
  fullTextTokens?: string[] | number[];

  createdAt?: Date | string;

  updatedAt?: Date | string;

  @Prop()
  __isDeleted?: boolean;

  @Prop()
  deletedAt?: Date;

  @Prop({
    // type: mongoose.Schema.Types.ObjectId,
    // ref: User?.name ?? "User",
  })
  createdBy?: string;

  @Prop({
    // type: mongoose.Schema.Types.ObjectId,
    // ref: User?.name ?? "User",
  })
  deletedBy?: string;

  @Prop({
    // type: mongoose.Schema.Types.ObjectId,
    // ref: User?.name ?? "User",
  })
  updatedBy?: string;

  @Prop()
  tenant?: string;
}
