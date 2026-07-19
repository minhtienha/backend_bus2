import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const ContentSchema = z.discriminatedUnion('kind', [
  // Kịch bản 1: Nếu kind là url thì bắt buộc có url hợp lệ, text sẽ tự động biến thành null thực sự
  z.object({
    kind: z.literal('url'),
    url: z.string().url({ message: 'url không đúng định dạng' }),
    text: z
      .any()
      .optional()
      .transform(() => null),
  }),

  // Kịch bản 2: Nếu kind là text hoặc loại khác, bắt buộc có text, url sẽ tự động biến thành null thực sự
  z.object({
    kind: z.literal('text'),
    text: z
      .string()
      .min(1, { message: 'Nội dung đoạn văn không được để trống' }),
    url: z
      .any()
      .optional()
      .transform(() => null),
  }),
]);

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
    .min(1, 'subtitle không được để trống'),

  content: ContentSchema,

  imageUrl: z
    .string()
    .url({ message: 'imageUrl không đúng định dạng' })
    .optional()
    .or(z.literal('')),
});

export class CreateNewsDto extends createZodDto(CreateNewsSchema) {}
