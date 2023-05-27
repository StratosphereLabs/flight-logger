import { z } from 'zod';

export const getAirframeSchema = z
  .object({
    icao24: z.string().optional(),
    registration: z.string().optional(),
  })
  .refine(
    ({ icao24, registration }) =>
      icao24 === undefined && registration === undefined,
    'At least one argument is required.',
  );
