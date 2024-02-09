import { z } from 'zod';
import { airportSchema } from '../../prisma/generated/zod';

export const cityPairDataSchema = z.object({
  firstAirport: airportSchema,
  secondAirport: airportSchema,
  count: z.number().int().positive(),
});

export const routeDataSchema = z.object({
  departureAirport: airportSchema,
  arrivalAirport: airportSchema,
  count: z.number().int().positive(),
});

export type CityPairData = z.infer<typeof cityPairDataSchema>;

export type RouteData = z.infer<typeof routeDataSchema>;
