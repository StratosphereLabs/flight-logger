import { z } from 'zod';
import { DATE_REGEX_ISO, TIME_REGEX_24H } from '../constants';
import {
  aircraft_typeSchema,
  airlineSchema,
  airportSchema,
} from '../../prisma/generated/zod';

export const itineraryFlightSchema = z.object({
  id: z.string().uuid(),
  departureAirport: airportSchema
    .nullable()
    .refine(item => item !== null, 'Airport is required.'),
  arrivalAirport: airportSchema
    .nullable()
    .refine(item => item !== null, 'Airport is required.'),
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
  airline: airlineSchema.nullable(),
  aircraftType: aircraft_typeSchema.nullable(),
  flightNumber: z
    .number()
    .int()
    .lte(9999, 'Must be 4 digits or less')
    .nullable(),
  class: z
    .enum(['BASIC', 'ECONOMY', 'PREMIUM', 'BUSINESS', 'FIRST'])
    .nullable(),
});

export const getItinerarySchema = z.object({
  id: z.string().uuid('Must be a valid UUID'),
});

export const addItinerarySchema = z.array(itineraryFlightSchema);

export type AddItineraryRequest = z.infer<typeof addItinerarySchema>;

export type ItineraryFlight = z.infer<typeof itineraryFlightSchema>;
