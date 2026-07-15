import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const SubscribeTopicSchema = z.object({
  topicId: z
    .string({ message: 'topicId không được để trống' })
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/, {
      message: 'topicId phải là định dạng ObjectId hợp lệ',
    }),
  deviceToken: z
    .string({ message: 'deviceToken không được để trống' })
    .trim()
    .min(1, 'deviceToken không được để trống'),
  userId: z
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/, {
      message: 'userId phải là định dạng ObjectId hợp lệ',
    })
    .optional(),
});

export class SubscribeTopicDto extends createZodDto(SubscribeTopicSchema) {}
