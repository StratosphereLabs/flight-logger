import { z } from 'zod';

// import { addFlightSchema } from './flights';
import { paginationSchema } from './pagination';

export const searchSchema = paginationSchema.extend({
  query: z.string().min(1, 'Search term required'),
});

export const profileSearchSchema = z.object({
  isFlightsFullScreen: z.boolean().optional(),
  isStatsFullScreen: z.boolean().optional(),
  isMapFullScreen: z.boolean().optional(),
  addFlight: z.boolean().optional(),
});

export type SearchRequest = z.infer<typeof searchSchema>;
