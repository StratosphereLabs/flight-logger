import { z } from 'zod';
import { DATE_REGEX, TIME_REGEX } from '../constants';

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
  outDate: z.string().min(1, 'Required').regex(DATE_REGEX, 'Invalid Date'),
  outTime: z.string().min(1, 'Required').regex(TIME_REGEX, 'Invalid Time'),
  offTime: z.string().regex(TIME_REGEX, 'Invalid Time').nullable(),
  onTime: z.string().regex(TIME_REGEX, 'Invalid Time').nullable(),
  inTime: z.string().min(1, 'Required').regex(TIME_REGEX, 'Invalid Time'),
  class: z
    .enum(['BASIC', 'ECONOMY', 'PREMIUM', 'BUSINESS', 'FIRST'])
    .nullable(),
  seatNumber: z.string().trim(),
  seatPosition: z.enum(['AISLE', 'MIDDLE', 'WINDOW']).nullable(),
  reason: z.enum(['BUSINESS', 'LEISURE', 'CREW']).nullable(),
  comments: z.string().trim(),
  trackingLink: z.string().trim(),
});

export const editFlightSchema = addFlightSchema
  .omit({ offTime: true, onTime: true })
  .extend({
    id: z.string().uuid(),
  });

export type GetFlightRequest = z.infer<typeof getFlightSchema>;

export type AddFlightRequest = z.infer<typeof addFlightSchema>;

export type EditFlightRequest = z.infer<typeof editFlightSchema>;
