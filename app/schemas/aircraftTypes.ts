import { z } from 'zod';
import { paginationSchema } from './pagination';

export const getAircraftTypeSchema = z.object({
  id: z.string().min(1, 'Required'),
});

export const getAircraftTypesSchema = paginationSchema.extend({
  sortKey: z.string().optional(),
  sort: z
    .enum(['asc', 'desc'], { required_error: 'Invalid sort option' })
    .optional(),
});

export type GetAircraftTypeRequest = z.infer<typeof getAircraftTypeSchema>;

export type GetAircraftTypesRequest = z.infer<typeof getAircraftTypesSchema>;
