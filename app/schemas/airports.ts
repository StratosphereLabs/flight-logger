import { z } from 'zod';
import { paginationSchema } from './pagination';
import { profileFiltersSchema } from './users';

export const getAirportSchema = profileFiltersSchema.extend({
  id: z.string().min(1, 'Required'),
  showCompleted: z.boolean(),
  showUpcoming: z.boolean(),
  username: z.string().trim().optional(),
});

export const getAirportsSchema = paginationSchema.extend({
  sortKey: z.string().optional(),
  sort: z
    .enum(['asc', 'desc'], { required_error: 'Invalid sort option' })
    .optional(),
});

export type GetAirportRequest = z.infer<typeof getAirportSchema>;

export type GetAirportsRequest = z.infer<typeof getAirportsSchema>;
