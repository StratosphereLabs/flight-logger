import { z } from 'zod';
import { paginationSchema } from './pagination';

export const getCountrySchema = z.object({
  id: z.string().min(1, 'Required'),
});

export const getCountriesSchema = paginationSchema.extend({
  sortKey: z
    .enum(['id', 'name'], {
      required_error: 'Invalid sort key',
    })
    .optional(),
  sort: z
    .enum(['asc', 'desc'], { required_error: 'Invalid sort option' })
    .optional(),
});

export type GetCountryRequest = z.infer<typeof getCountrySchema>;

export type GetCountriesRequest = z.infer<typeof getCountriesSchema>;
