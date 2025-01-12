import { z } from 'zod';

import { getUserProfileFlightsSchema, profileFiltersSchema } from './flights';
import { getUserSchema } from './users';

export const getStatisticsBarGraphSchema = getUserProfileFlightsSchema.extend(
  profileFiltersSchema.shape,
);

export const getUserTopRoutesSchema = getStatisticsBarGraphSchema.extend({
  cityPairs: z.boolean(),
});

export const getUserTopAirlinesSchema = getStatisticsBarGraphSchema.extend({
  mode: z.enum(['flights', 'distance', 'duration']),
});

export const getUserTopAircraftTypesSchema = getStatisticsBarGraphSchema.extend(
  {
    mode: z.enum(['flights', 'distance', 'duration']),
  },
);

export const getUserTopAirportsSchema = getStatisticsBarGraphSchema.extend({
  mode: z.enum(['all', 'departure', 'arrival']),
});

export const getUserTopCountriesSchema = getStatisticsBarGraphSchema.extend({
  mode: z.enum(['all', 'departure', 'arrival']),
});

export const getUserTopRegionsSchema = getStatisticsBarGraphSchema.extend({
  mode: z.enum(['all', 'departure', 'arrival']),
});

export const getStatisticsDistributionSchema = getUserSchema
  .extend(profileFiltersSchema.shape)
  .extend({
    selectedAirportId: z.string().nullable(),
  });

export const getUserFlightTypesSchema = getStatisticsDistributionSchema.extend({
  mode: z.enum(['flights', 'distance', 'duration']),
  selectedAirportId: z.string().nullable(),
});

export const routeDataSchema = z.object({
  route: z.string(),
  flights: z.number().int().positive(),
});

export const airportDataSchema = z.object({
  id: z.string(),
  airport: z.string(),
  name: z.string(),
  flights: z.number().int().positive(),
});

export const airlineDataSchema = z.object({
  id: z.string(),
  airline: z.string(),
  name: z.string(),
  flights: z.number().int().positive(),
  duration: z.number().int().positive(),
  distance: z.number().positive(),
});

export const aircraftTypeDataSchema = z.object({
  id: z.string(),
  aircraftType: z.string(),
  name: z.string(),
  flights: z.number().int().positive(),
  duration: z.number().int().positive(),
  distance: z.number().positive(),
});

export const countryDataSchema = z.object({
  id: z.string(),
  country: z.string(),
  flights: z.number().int().positive(),
});

export const regionDataSchema = z.object({
  id: z.string(),
  region: z.string(),
  flights: z.number().int().positive(),
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

export type CountryData = z.infer<typeof countryDataSchema>;

export type RegionData = z.infer<typeof regionDataSchema>;

export type ReasonData = z.infer<typeof reasonDataSchema>;

export type SeatPositionData = z.infer<typeof seatPositionDataSchema>;

export type ClassData = z.infer<typeof classDataSchema>;

export type FlightTypeData = z.infer<typeof flightTypeSchema>;

export type FlightLengthData = z.infer<typeof flightLengthSchema>;
