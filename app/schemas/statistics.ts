import { z } from 'zod';
import { getUserProfileFlightsSchema, getUserSchema } from './users';

export const getUserTopRoutesSchema = getUserProfileFlightsSchema.extend({
  cityPairs: z.boolean(),
});

export const getUserTopAirlinesSchema = getUserProfileFlightsSchema.extend({
  mode: z.enum(['flights', 'distance', 'duration']),
});

export const getUserTopAircraftTypesSchema = getUserProfileFlightsSchema.extend(
  {
    mode: z.enum(['flights', 'distance', 'duration']),
  },
);

export const getUserTopAirportsSchema = getUserProfileFlightsSchema.extend({
  mode: z.enum(['all', 'departure', 'arrival']),
});

export const getUserFlightTypesSchema = getUserSchema.extend({
  mode: z.enum(['flights', 'distance', 'duration']),
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
  duration: z.number().int().positive(),
  distance: z.number().positive(),
});

export const aircraftTypeDataSchema = z.object({
  id: z.string(),
  aircraftType: z.string(),
  flights: z.number().int().positive(),
  duration: z.number().int().positive(),
  distance: z.number().positive(),
});

export const reasonDataSchema = z.object({
  reason: z.string(),
  flights: z.number().int().positive(),
  duration: z.number().int().positive(),
  distance: z.number().positive(),
});

export const seatPositionDataSchema = z.object({
  seatPosition: z.string(),
  flights: z.number().int().positive(),
  duration: z.number().int().positive(),
  distance: z.number().positive(),
});

export const classDataSchema = z.object({
  flightClass: z.string(),
  flights: z.number().int().positive(),
  duration: z.number().int().positive(),
  distance: z.number().positive(),
});

export const flightTypeSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.number().int().positive(),
});

export const flightLengthSchema = z.object({
  flightLength: z.string(),
  flights: z.number().int().positive(),
  duration: z.number().int().positive(),
  distance: z.number().positive(),
});

export type GetUserTopRoutesSchema = z.infer<typeof getUserTopRoutesSchema>;

export type GetUserTopAirlinesSchema = z.infer<typeof getUserTopAirlinesSchema>;

export type GetUserTopAircraftTypesSchema = z.infer<
  typeof getUserTopAircraftTypesSchema
>;

export type GetUserTopAirportsSchema = z.infer<typeof getUserTopAirportsSchema>;

export type GetUserFlightTypesSchema = z.infer<typeof getUserFlightTypesSchema>;

export type RouteData = z.infer<typeof routeDataSchema>;

export type AirlineData = z.infer<typeof airlineDataSchema>;

export type AirportData = z.infer<typeof airportDataSchema>;

export type AircraftTypeData = z.infer<typeof aircraftTypeDataSchema>;

export type ReasonData = z.infer<typeof reasonDataSchema>;

export type SeatPositionData = z.infer<typeof seatPositionDataSchema>;

export type ClassData = z.infer<typeof classDataSchema>;

export type FlightTypeData = z.infer<typeof flightTypeSchema>;

export type FlightLengthData = z.infer<typeof flightLengthSchema>;
