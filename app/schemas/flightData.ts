import { z } from 'zod';

import {
  AircraftTypeSchema,
  AirframeSchema,
  AirlineSchema,
  AirportSchema,
} from '../../prisma/generated/zod';
import { DATE_REGEX_ISO, TIME_REGEX_24H } from '../constants';

export const searchFlightDataSchema = z.object({
  outDateISO: z
    .string()
    .min(1, 'Required')
    .regex(DATE_REGEX_ISO, 'Invalid Date'),
  airline: AirlineSchema.nullable().refine(item => item !== null, 'Required'),
  flightNumber: z
    .number()
    .int()
    .lte(9999, 'Must be 4 digits or less')
    .nullable()
    .refine(item => item !== null, 'Required'),
});

export const addFlightFromDataSchema = z.object({
  username: z.string().optional(),
  airline: AirlineSchema.nullable(),
  flightNumber: z
    .number()
    .int()
    .lte(9999, 'Must be 4 digits or less')
    .nullable(),
  departureIcao: z.string().length(4, 'Length must be 4'),
  arrivalIcao: z.string().length(4, 'Length must be 4'),
  outTime: z.string().datetime(),
  inTime: z.string().datetime(),
});

export const addFlightSchema = searchFlightDataSchema.extend({
  departureAirport: AirportSchema.nullable().refine(
    item => item !== null,
    'Airport is required.',
  ),
  arrivalAirport: AirportSchema.nullable().refine(
    item => item !== null,
    'Airport is required.',
  ),
  aircraftType: AircraftTypeSchema.nullable(),
  airframe: AirframeSchema.extend({
    type: z.enum(['existing', 'custom']),
    operator: AirlineSchema.nullable(),
    aircraftType: AircraftTypeSchema.nullable(),
  }).nullable(),
  outTimeValue: z
    .string()
    .min(1, 'Required')
    .regex(TIME_REGEX_24H, 'Invalid Time'),
  inTimeValue: z
    .string()
    .min(1, 'Required')
    .regex(TIME_REGEX_24H, 'Invalid Time'),
  class: z
    .enum(['BASIC', 'ECONOMY', 'PREMIUM', 'BUSINESS', 'FIRST'])
    .nullable(),
  seatNumber: z.string().trim(),
  seatPosition: z.enum(['AISLE', 'MIDDLE', 'WINDOW']).nullable(),
  reason: z.enum(['BUSINESS', 'LEISURE', 'CREW']).nullable(),
  comments: z.string().trim(),
});

export type FlightSearchFormData = z.infer<typeof searchFlightDataSchema>;

export type AddFlightFromDataRequest = z.infer<typeof addFlightFromDataSchema>;
