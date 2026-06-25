import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { FeedbackCategory, FeedbackStatus } from '../../feedbacks/index.js';

const GeoLocationSchema = z.object({
  type: z.literal('Point', { message: 'Type phải là Point' }),
  coordinates: z
    .array(z.number({ message: 'Tọa độ phải là kiểu số' }))
    .length(2, { message: 'Tọa độ phải gồm chính xác 2 số [kinh độ, vĩ độ]' }),
  address: z.string({ message: 'Địa chỉ hiển thị không được để trống' }),
});

export const CreateFeedbackZodSchema = z.object({
  Category: z
    .nativeEnum(FeedbackCategory, { message: 'Danh mục không hợp lệ' })
    .default(FeedbackCategory.SUGGESTION),

  Content: z
    .string({ message: 'Nội dung không được để trống' })
    .min(1, 'Nội dung phải có ít nhất 1 ký tự'),

  Location: GeoLocationSchema,

  Status: z.nativeEnum(FeedbackStatus).default(FeedbackStatus.PENDING),

  IsPublic: z.boolean().default(false),

  ImageUrl: z
    .array(z.string().url({ message: 'URL hình ảnh không hợp lệ' }))
    .optional(),

  FullName: z.string().optional(),

  PhoneNumber: z.string().optional(),

  Email: z
    .string()
    .email({ message: 'Email không hợp lệ' })
    .or(z.literal(''))
    .optional(),

  IsAnonymous: z.boolean().default(false),

  createdBy: z.string().optional(),

  updatedBy: z.string().optional(),

  deviceToken: z.string().optional(),
});

export class CreateFeedbackDto extends createZodDto(CreateFeedbackZodSchema) {}
export class GeoLocationDto extends createZodDto(GeoLocationSchema) {}
