import { z } from 'zod';

export const cityPairDataSchema = z.object({
  cityPair: z.string(),
  flights: z.number().int().positive(),
});

export const routeDataSchema = z.object({
  route: z.string(),
  flights: z.number().int().positive(),
});

export const airportDataSchema = z.object({
  id: z.string(),
  airport: z.string(),
  flights: z.number().int().positive(),
});

export const airlineDataSchema = z.object({
  id: z.string(),
  airline: z.string(),
  flights: z.number().int().positive(),
});

export type CityPairData = z.infer<typeof cityPairDataSchema>;

export type RouteData = z.infer<typeof routeDataSchema>;

export type AirlineData = z.infer<typeof airlineDataSchema>;

export type AirportData = z.infer<typeof airportDataSchema>;
