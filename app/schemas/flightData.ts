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
    .refine(item => item !== null, 'Airline is required.'),
  flightNumber: z
    .number()
    .int()
    .lte(9999, 'Must be 4 digits or less')
    .nullable()
    .refine(item => item !== null, 'Required.'),
});

export type FetchFlightsByFlightNumberRequest = z.infer<
  typeof fetchFlightsByFlightNumberSchema
>;
