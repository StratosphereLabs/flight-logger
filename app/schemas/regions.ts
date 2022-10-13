import { z } from 'zod';
import { paginationSchema } from './pagination';

export const getRegionSchema = z.object({
  id: z.string().min(1, 'Required'),
});

export const getRegionsSchema = paginationSchema.extend({
  sortKey: z.string().optional(),
  sort: z
    .enum(['asc', 'desc'], { required_error: 'Invalid sort option' })
    .optional(),
});

export type GetRegionRequest = z.infer<typeof getRegionSchema>;

export type GetRegionsRequest = z.infer<typeof getRegionsSchema>;
