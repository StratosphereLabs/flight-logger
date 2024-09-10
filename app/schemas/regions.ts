import { z } from 'zod';
import { paginationSchema } from './pagination';

export const getRegionsSchema = paginationSchema.extend({
  sortKey: z.string().optional(),
  sort: z
    .enum(['asc', 'desc'], { required_error: 'Invalid sort option' })
    .optional(),
});

export type GetRegionsRequest = z.infer<typeof getRegionsSchema>;
