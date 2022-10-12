import { z } from 'zod';

const TIME_REGEX = /^[0-9]{2}:[0-9]{2}$/;
const DATE_REGEX = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;

export const addFlightSchema = z.object({
  departureAirportId: z.string().min(1, 'Required'),
  arrivalAirportId: z.string().min(1, 'Required'),
  airlineId: z.string().nullable(),
  aircraftTypeId: z.string().nullable(),
  flightNumber: z.number().int().nullable(),
  callsign: z.string().nullable(),
  tailNumber: z.string().nullable(),
  outDate: z.string().min(1, 'Required').regex(DATE_REGEX, 'Invalid Date'),
  outTime: z.string().regex(TIME_REGEX, 'Invalid Time').nullable(),
  offTime: z.string().regex(TIME_REGEX, 'Invalid Time').nullable(),
  onTime: z.string().regex(TIME_REGEX, 'Invalid Time').nullable(),
  inTime: z.string().regex(TIME_REGEX, 'Invalid Time').nullable(),
  class: z
    .enum(['BASIC', 'ECONOMY', 'PREMIUM', 'BUSINESS', 'FIRST'])
    .nullable(),
  seatNumber: z.string().nullable(),
  seatPosition: z.enum(['AISLE', 'MIDDLE', 'WINDOW']).nullable(),
  reason: z.enum(['BUSINESS', 'LEISURE', 'OTHER']).nullable(),
  comments: z.string().nullable(),
  trackingLink: z.string().nullable(),
});
