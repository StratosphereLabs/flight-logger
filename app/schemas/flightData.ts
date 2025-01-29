import { z } from 'zod';

import { AirlineSchema } from '../../prisma/generated/zod';
import { DATE_REGEX_ISO } from '../constants';

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

export type FlightSearchFormData = z.infer<typeof searchFlightDataSchema>;

export type AddFlightFromDataRequest = z.infer<typeof addFlightFromDataSchema>;
