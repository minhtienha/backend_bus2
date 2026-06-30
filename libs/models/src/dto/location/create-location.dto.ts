import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const CreateLocationSchema = z.object({
  name: z
    .string({
      message: 'Tên địa điểm không được để trống',
    })
    .min(1, 'Tên địa điểm phải có ít nhất 1 ký tự')
    .trim(),

  coordinates: z
    .array(
      z.number({
        message: 'Tọa độ phải là một số',
      }),
      {
        message: 'Tọa độ không được để trống',
      },
    )
    .length(2, 'Tọa độ phải bao gồm chính xác 2 phần tử [Kinh độ, Vĩ độ]')
    // Validate thêm dải địa lý thực tế (Kinh độ từ -180 đến 180, Vĩ độ từ -90 đến 90)
    .refine(
      (coords) => {
        const [lng, lat] = coords;
        return lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
      },
      {
        message:
          'Tọa độ không hợp lệ (Kinh độ: -180 đến 180, Vĩ độ: -90 đến 90)',
      },
    ),
});

export class CreateLocationDto extends createZodDto(CreateLocationSchema) {}
