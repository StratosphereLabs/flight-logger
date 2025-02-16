import { z } from 'zod';

export const routeDataSchema = z.object({
  route: z.string(),
  flights: z.number().int().positive(),
});

export const airportDataSchema = z.object({
  id: z.string(),
  airport: z.string(),
  name: z.string(),
  all: z.number().int().positive(),
  departure: z.number().int().positive(),
  arrival: z.number().int().positive(),
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
  all: z.number().int().positive(),
  departure: z.number().int().positive(),
  arrival: z.number().int().positive(),
});

export const regionDataSchema = z.object({
  id: z.string(),
  region: z.string(),
  all: z.number().int().positive(),
  departure: z.number().int().positive(),
  arrival: z.number().int().positive(),
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
  flights: z.number().int().positive(),
  duration: z.number().int().positive(),
  distance: z.number().positive(),
});

export const flightLengthSchema = z.object({
  flightLength: z.string(),
  flights: z.number().int().positive(),
  duration: z.number().int().positive(),
  distance: z.number().positive(),
});

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
