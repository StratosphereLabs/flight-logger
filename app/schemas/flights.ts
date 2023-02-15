import { z } from 'zod';
import { DATE_REGEX_ISO, TIME_REGEX_24H } from '../constants';

export const getFlightSchema = z.object({
  id: z.string().uuid(),
});

export const deleteFlightSchema = z.object({
  id: z.string().uuid(),
});

export const addFlightSchema = z.object({
  departureAirportId: z.string().min(1, 'Required'),
  arrivalAirportId: z.string().min(1, 'Required'),
  airlineId: z.string(),
  aircraftTypeId: z.string(),
  flightNumber: z.number().int().nullable(),
  callsign: z.string().trim(),
  tailNumber: z.string().trim(),
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
