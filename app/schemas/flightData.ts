import { z } from 'zod';
import { airlineSchema } from '../../prisma/generated/zod';
import { DATE_REGEX_ISO } from '../constants';

export const fetchFlightsByFlightNumberSchema = z.object({
  outDateISO: z
    .string()
    .min(1, 'Required')
    .regex(DATE_REGEX_ISO, 'Invalid Date'),
  airline: airlineSchema
    .nullable()
    .refine(item => item !== null, 'Airline is required'),
  flightNumber: z
    .number()
    .int()
    .lte(9999, 'Must be 4 digits or less')
    .nullable()
    .refine(item => item !== null, 'Required'),
});

export const fetchFlightDataSchema = fetchFlightsByFlightNumberSchema.extend({
  departureIata: z.string().length(3, 'Length must be 3'),
  arrivalIata: z.string().length(3, 'Length must be 3'),
});

export type FetchFlightsByFlightNumberRequest = z.infer<
  typeof fetchFlightsByFlightNumberSchema
>;

export type FetchFlightDataRequest = z.infer<typeof fetchFlightDataSchema>;
