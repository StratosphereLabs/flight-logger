import { z } from 'zod';

// import { addFlightSchema } from './flights';
import { paginationSchema } from './pagination';

export const searchSchema = paginationSchema.extend({
  query: z.string().min(1, 'Search term required'),
});

export type SearchRequest = z.infer<typeof searchSchema>;
