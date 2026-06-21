import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { FeedbackCategory, FeedbackStatus } from '../../feedbacks/index.js';

export const CreateFeedbackZodSchema = z.object({
  Category: z.nativeEnum(FeedbackCategory).default(FeedbackCategory.SUGGESTION),

  Content: z
    .string({ message: 'Nội dung không được để trống' })
    .min(1, 'Nội dung phải có ít nhất 1 ký tự'),

  Status: z.nativeEnum(FeedbackStatus).default(FeedbackStatus.PENDING),

  IsPublic: z.boolean().default(false),

  ImageUrl: z.string().optional(),
});

export class CreateFeedbackDto extends createZodDto(CreateFeedbackZodSchema) {}
