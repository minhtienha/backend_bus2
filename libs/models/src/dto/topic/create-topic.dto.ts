import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateTopicSchema = z.object({
  name: z
    .string({ message: 'Tên chủ đề không được để trống' })
    .trim()
    .min(1, 'Tên chủ đề không được để trống')
    .max(256, 'Tên chủ đề không được vượt quá 256 ký tự'),
  description: z
    .string()
    .trim()
    .max(1024, 'Mô tả không được vượt quá 1024 ký tự')
    .optional(),
});

export class CreateTopicDto extends createZodDto(CreateTopicSchema) {}
