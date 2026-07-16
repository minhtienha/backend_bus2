import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// Định nghĩa Schema phụ cho object content
const ContentSchema = z.object({
  kind: z.string().optional(),
  url: z.string().url({ message: 'url không đúng định dạng' }), // Validate định dạng URL hợp lệ
});

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

  // 1. Đổi từ subtitle thành publishedAt để khớp với JSON
  subtitle: z
    .string({ message: 'publishedAt không được để trống' })
    .trim()
    .min(1, 'publishedAt không được để trống'),

  // 2. Chuyển content từ string thành một Object cụ thể
  content: ContentSchema,

  // 3. Đổi từ imageUrl thành image và thêm validate URL
  imageUrl: z.string().optional(),
});

export class CreateNewsDto extends createZodDto(CreateNewsSchema) {}
