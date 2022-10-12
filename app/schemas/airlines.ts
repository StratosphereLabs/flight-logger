import { z } from 'zod';
import { paginationSchema } from './pagination';

export const getAirlineSchema = z.object({
  id: z.string().min(1, 'Required'),
});

export const getAirlinesSchema = paginationSchema.extend({
  sortKey: z
    .enum(['id', 'iata', 'icao', 'name'], {
      required_error: 'Invalid sort key',
    })
    .optional(),
  sort: z
    .enum(['asc', 'desc'], { required_error: 'Invalid sort option' })
    .optional(),
});

export type GetAirlineRequest = z.infer<typeof getAirlineSchema>;

export type GetAirlinesRequest = z.infer<typeof getAirlinesSchema>;
