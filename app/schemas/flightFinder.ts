import { z } from 'zod';
import { DATE_REGEX_ISO } from '../constants';

export const flightFinderRequestSchema = z.object({
  departureAirport: z.string().length(3, 'Invalid IATA Code').toUpperCase(),
  arrivalAirport: z.string().length(3, 'Invalid IATA Code').toUpperCase(),
  dateFrom: z.string().regex(DATE_REGEX_ISO, 'Invalid Date'),
});

export type FlightFinderRequest = z.infer<typeof flightFinderRequestSchema>;
