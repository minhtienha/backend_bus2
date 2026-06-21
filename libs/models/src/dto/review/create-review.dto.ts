import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateReviewSchema = z.object({
  userId: z.string({ message: 'userId không được để trống khi test' }),

  userName: z
    .string({ message: 'Tên người dùng không được để trống' })
    .trim()
    .min(2, 'Tên người dùng phải có ít nhất 2 ký tự')
    .max(50, 'Tên người dùng không được vượt quá 50 ký tự'),

  email: z
    .string({ message: 'Email không được để trống' })
    .trim()
    .email('Địa chỉ email không đúng định dạng'),

  routeName: z
    .string({ message: 'Tên tuyến xe bus không được để trống' })
    .trim()
    .min(1, 'Tên tuyến xe không được để trống'),

  rating: z
    .number({ message: 'Điểm đánh giá không được để trống' })
    .int('Điểm đánh giá phải là số nguyên')
    .min(1, 'Điểm đánh giá tối thiểu là 1 sao')
    .max(5, 'Điểm đánh giá tối đa là 5 sao'),

  licensePlate: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[0-9]{2}[A-Z]-[0-9]{4,5}$|^[0-9]{2}[A-Z][0-9]{5}$/, {
      message:
        'Biển số xe không đúng định dạng (Ví dụ: 51G-12345 hoặc 51G12345)',
    })
    .optional(),

  comment: z
    .string()
    .trim()
    .min(10, 'Nội dung đánh giá phải có ít nhất 10 ký tự')
    .max(500, 'Nội dung đánh giá không được quá 500 ký tự')
    .optional(),
});

export class CreateReviewDto extends createZodDto(CreateReviewSchema) {}
