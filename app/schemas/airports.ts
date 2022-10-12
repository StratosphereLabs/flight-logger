import { z } from 'zod';
import { paginationSchema } from './pagination';

export const getAirportSchema = z.object({
  id: z.string().min(1, 'Required'),
});

export const getAirportsSchema = paginationSchema.extend({
  sortKey: z
    .enum(['id', 'iata', 'name'], {
      required_error: 'Invalid sort key',
    })
    .optional(),
  sort: z
    .enum(['asc', 'desc'], { required_error: 'Invalid sort option' })
    .optional(),
});

export type GetAirportRequest = z.infer<typeof getAirportSchema>;

export type GetAirportsRequest = z.infer<typeof getAirportsSchema>;
