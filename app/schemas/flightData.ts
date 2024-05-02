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
    aircraftTypeIcao: z.string().nullable(),
    departureTime: z.number().int(),
    departureTimeEstimated: z.number().int().nullable(),
    departureTimeActual: z.number().int().nullable(),
    departureTerminal: z.string().nullable(),
    departureGate: z.string().nullable(),
    arrivalTime: z.number().int(),
    arrivalTimeEstimated: z.number().int().nullable(),
    arrivalTimeActual: z.number().int().nullable(),
    arrivalTerminal: z.string().nullable(),
    arrivalGate: z.string().nullable(),
  });

export type FetchFlightsByFlightNumberRequest = z.infer<
  typeof fetchFlightsByFlightNumberSchema
>;

export type FlightSearchFormData = z.infer<typeof flightSearchFormSchema>;

export type AddFlightFromDataRequest = z.infer<typeof addFlightFromDataSchema>;
