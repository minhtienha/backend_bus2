import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateNewsSchema = z.object({
  topicId: z
    .string({ message: 'topicId không được để trống' })
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/, {
      message: 'topicId phải là định dạng ObjectId hợp lệ',
    }),
  title: z
    .string({ message: 'title không được để trống' })
    .trim()
    .min(1, 'title không được để trống')
    .max(256, 'title không được vượt quá 256 ký tự'),
  subtitle: z
    .string({ message: 'subtitle không được để trống' })
    .trim()
    .min(1, 'subtitle không được để trống')
    .max(256, 'subtitle không được vượt quá 256 ký tự'),
  content: z
    .string({ message: 'content không được để trống' })
    .trim()
    .min(1, 'content không được để trống')
    .max(256, 'content không được vượt quá 256 ký tự'),

  imageUrl: z.string(),
});

export class CreateNewsDto extends createZodDto(CreateNewsSchema) {}
