import { z } from 'zod';

import {
  AircraftTypeSchema,
  AirlineSchema,
  AirportSchema,
} from '../../prisma/generated/zod';
import { DATE_REGEX_ISO, TIME_REGEX_24H } from '../constants';

export const itineraryFlightSchema = z.object({
  id: z.string().uuid(),
  departureAirport: AirportSchema.nullable().refine(
    item => item !== null,
    'Airport is required.',
  ),
  arrivalAirport: AirportSchema.nullable().refine(
    item => item !== null,
    'Airport is required.',
  ),
  outDateISO: z
    .string()
    .min(1, 'Required')
    .regex(DATE_REGEX_ISO, 'Invalid Date'),
  outTimeValue: z
    .string()
    .min(1, 'Required')
    .regex(TIME_REGEX_24H, 'Invalid Time'),
  inTimeValue: z
    .string()
    .min(1, 'Required')
    .regex(TIME_REGEX_24H, 'Invalid Time'),
  airline: AirlineSchema.nullable(),
  aircraftType: AircraftTypeSchema.nullable(),
  flightNumber: z
    .number()
    .int()
    .lte(9999, 'Must be 4 digits or less')
    .nullable(),
});

export const getItinerarySchema = z.object({
  id: z.string().uuid('Must be a valid UUID'),
});

export const addItinerarySchema = z.object({
  name: z.string().trim().min(1, 'Invalid itinerary name.').optional(),
  flights: z
    .array(itineraryFlightSchema)
    .min(1, 'Must add at least one flight.'),
});

export const deleteItinerarySchema = z.object({
  id: z.string().uuid(),
});

export type AddItineraryRequest = z.infer<typeof addItinerarySchema>;

export type ItineraryFlight = z.infer<typeof itineraryFlightSchema>;
