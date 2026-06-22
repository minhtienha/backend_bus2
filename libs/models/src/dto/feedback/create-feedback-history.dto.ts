import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { FeedbackStatus } from '../../feedbacks/index.js';

export const CreateFeedbackHistoryZodSchema = z.object({
  FeedbackId: z.string({ message: 'FeedbackId là bắt buộc' }).min(1),

  Status: z.nativeEnum(FeedbackStatus, { message: 'Trạng thái không hợp lệ' }),

  Note: z.string().optional(),

  ActionBy: z.string().default('Đơn vị quản lý'),
});

export class CreateFeedbackHistoryDto extends createZodDto(
  CreateFeedbackHistoryZodSchema,
) {}
