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

export const flightSearchFormSchema = fetchFlightsByFlightNumberSchema.extend({
  userType: z.enum(['me', 'other']),
});

export const addFlightFromDataSchema = fetchFlightsByFlightNumberSchema
  .omit({ outDateISO: true })
  .extend({
    username: z.string().optional(),
    departureIcao: z.string().length(4, 'Length must be 4'),
    arrivalIcao: z.string().length(4, 'Length must be 4'),
    outTime: z.string().datetime(),
    inTime: z.string().datetime(),
  });

export type FetchFlightsByFlightNumberRequest = z.infer<
  typeof fetchFlightsByFlightNumberSchema
>;

export type FlightSearchFormData = z.infer<typeof flightSearchFormSchema>;

export type AddFlightFromDataRequest = z.infer<typeof addFlightFromDataSchema>;
