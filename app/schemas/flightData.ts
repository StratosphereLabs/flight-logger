import { z } from 'zod';

import { AirlineSchema } from '../../prisma/generated/zod';
import { DATE_REGEX_ISO } from '../constants';

export const searchFlightDataSchema = z
  .object({
    searchType: z.enum(['FLIGHT_NUMBER', 'ROUTE']),
    outDateISO: z
      .string()
      .min(1, 'Required')
      .regex(DATE_REGEX_ISO, 'Invalid Date'),
    airline: AirlineSchema.nullable(),
    flightNumber: z
      .number()
      .int()
      .lte(9999, 'Must be 4 digits or less')
      .nullable(),
    departureIata: z.string().length(3, 'Length must be 3').nullable(),
    arrivalIata: z.string().length(3, 'Length must be 3').nullable(),
  })
  .superRefine((val, ctx) => {
    if (val.searchType === 'FLIGHT_NUMBER') {
      if (val.airline === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Required',
          path: ['airline'],
        });
      }
      if (val.flightNumber === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Required',
          path: ['flightNumber'],
        });
      }
    } else if (val.searchType === 'ROUTE') {
      if (val.departureIata === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Required',
          path: ['departureIata'],
        });
      }
      if (val.arrivalIata === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Required',
          path: ['arrivalIata'],
        });
      }
    }
    return z.NEVER;
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
