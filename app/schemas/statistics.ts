import { z } from 'zod';
import { airlineSchema, airportSchema } from '../../prisma/generated/zod';

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

export const airportDataSchema = z.object({
  airport: airportSchema,
  count: z.number().int().positive(),
});

export const airlineDataSchema = z.object({
  airline: airlineSchema,
  count: z.number().int().positive(),
});

export type CityPairData = z.infer<typeof cityPairDataSchema>;

export type RouteData = z.infer<typeof routeDataSchema>;

export type AirlineData = z.infer<typeof airlineDataSchema>;

export type AirportData = z.infer<typeof airportDataSchema>;
