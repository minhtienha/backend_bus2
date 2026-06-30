import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { DefaultSchema } from '../common/default.schema';

export type LocationDocument = Location & Document;

@Schema({ timestamps: true })
export class Location extends DefaultSchema {
  @Prop({ type: String, required: true, trim: true })
  name!: string;

  @Prop({
    type: [Number],
    required: true,
    validate: {
      validator: function (val: number[]) {
        return val.length === 2;
      },
      message: 'Coordinates phải bao gồm chính xác 2 phần tử [Kinh độ, Vĩ độ]',
    },
  })
  coordinates!: [number, number];
}

export const LocationSchema = SchemaFactory.createForClass(Location);

// Thêm index 2dsphere nếu bạn muốn tìm kiếm vị trí gần/xa sau này
LocationSchema.index({ coordinates: '2dsphere' });
