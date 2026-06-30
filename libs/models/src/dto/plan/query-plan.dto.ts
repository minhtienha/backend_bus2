import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const QueryPlanSchema = z.object({
  lat: z
    .string()
    .regex(/^-?\d+(\.\d+)?$/, { message: 'Vĩ độ không hợp lệ' })
    .transform(Number),
  lng: z
    .string()
    .regex(/^-?\d+(\.\d+)?$/, { message: 'Kinh độ không hợp lệ' })
    .transform(Number),
  dlat: z
    .string()
    .regex(/^-?\d+(\.\d+)?$/, { message: 'Vĩ độ đích không hợp lệ' })
    .transform(Number),
  dlng: z
    .string()
    .regex(/^-?\d+(\.\d+)?$/, { message: 'Kinh độ đích không hợp lệ' })
    .transform(Number),
});

export class QueryPlanDto extends createZodDto(QueryPlanSchema) {}
