import { z } from 'zod';

export const paginationSchema = z.object({
  limit: z.number().min(1).max(50).optional(),
  page: z.number().optional(),
});

export type PaginationRequest = z.infer<typeof paginationSchema>;
