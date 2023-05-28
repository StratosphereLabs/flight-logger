import { z } from 'zod';
import {
  aircraft_typeSchema,
  airframeSchema,
  airlineSchema,
  airportSchema,
} from '../../prisma/generated/zod';
import { DATE_REGEX_ISO, TIME_REGEX_24H } from '../constants';

export const getFlightSchema = z.object({
  id: z.string().uuid(),
});

export const deleteFlightSchema = z.object({
  id: z.string().uuid(),
});

export const addFlightSchema = z.object({
  tripId: z.string().uuid('Must be valid UUID').optional(),
  departureAirport: airportSchema
    .nullable()
    .refine(item => item !== null, 'Airport is required.'),
  arrivalAirport: airportSchema
    .nullable()
    .refine(item => item !== null, 'Airport is required.'),
  airline: airlineSchema.nullable(),
  aircraftType: aircraft_typeSchema.nullable(),
  flightNumber: z
    .number()
    .int()
    .lte(9999, 'Must be 4 digits or less')
    .nullable(),
  tailNumber: z.string().trim(),
  airframe: airframeSchema
    .extend({
      operator: airlineSchema.nullable(),
    })
    .nullable(),
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
  class: z
    .enum(['BASIC', 'ECONOMY', 'PREMIUM', 'BUSINESS', 'FIRST'])
    .nullable(),
  seatNumber: z.string().trim(),
  seatPosition: z.enum(['AISLE', 'MIDDLE', 'WINDOW']).nullable(),
  reason: z.enum(['BUSINESS', 'LEISURE', 'CREW']).nullable(),
  comments: z.string().trim(),
  trackingLink: z.string().trim(),
});

export const editFlightSchema = addFlightSchema.extend({
  id: z.string().uuid('Must be a valid UUID'),
});

export type GetFlightRequest = z.infer<typeof getFlightSchema>;

export type AddFlightRequest = z.infer<typeof addFlightSchema>;

export type EditFlightRequest = z.infer<typeof editFlightSchema>;
