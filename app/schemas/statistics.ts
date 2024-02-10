import { z } from 'zod';
import { getUserProfileFlightsSchema } from './users';

export const getUserTopRoutesSchema = getUserProfileFlightsSchema.extend({
  cityPairs: z.boolean(),
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

export const aircraftTypeDataSchema = z.object({
  id: z.string(),
  aircraftType: z.string(),
  flights: z.number().int().positive(),
});

export type GetUserTopRoutesSchema = z.infer<typeof getUserTopRoutesSchema>;

export type RouteData = z.infer<typeof routeDataSchema>;

export type AirlineData = z.infer<typeof airlineDataSchema>;

export type AirportData = z.infer<typeof airportDataSchema>;

export type AircraftTypeData = z.infer<typeof aircraftTypeDataSchema>;
