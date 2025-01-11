import { isValid, parseISO } from 'date-fns';
import { z } from 'zod';

import {
  AircraftTypeSchema,
  AirframeSchema,
  AirlineSchema,
  AirportSchema,
} from '../../prisma/generated/zod';
import { DATE_REGEX_ISO, TIME_REGEX_24H } from '../constants';
import { paginationSchema } from './pagination';
import { getUserSchema } from './users';

export const getFlightSchema = z.object({
  id: z.string().uuid(),
});

export const profileFiltersSchema = z.object({
  status: z.enum(['completed', 'upcoming', 'all']),
  range: z.enum([
    'all',
    'pastYear',
    'pastMonth',
    'customYear',
    'customMonth',
    'customRange',
  ]),
  year: z.string().refine(yearString => {
    const number = parseInt(yearString, 10);
    if (isNaN(number)) return false;
    const currentYear = new Date().getFullYear();
    if (number < currentYear - 75 || number > currentYear + 1) return false;
    return true;
  }, 'Invalid Year'),
  month: z.enum([
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    '11',
    '12',
  ]),
  fromDate: z
    .string()
    .refine(date => isValid(parseISO(date)), 'Invalid From Date'),
  toDate: z.string().refine(date => isValid(parseISO(date)), 'Invalid To Date'),
});

export const getUserFlightsSchema = getUserSchema
  .extend(paginationSchema.shape)
  .extend(profileFiltersSchema.shape)
  .extend({
    withTrip: z.boolean().optional(),
    selectedAirportId: z.string().nullable(),
    searchQuery: z.string().trim(),
  });

export const getUserProfileFlightsSchema = paginationSchema
  .extend(getUserSchema.shape)
  .extend(profileFiltersSchema.shape)
  .extend({
    selectedAirportId: z.string().nullable(),
  });

export const getUserMapDataSchema = getUserSchema.extend(
  profileFiltersSchema.shape,
);

export const getFlightChangelogSchema = getFlightSchema.extend(
  paginationSchema.shape,
);

export const getExtraFlightDataSchema = z.object({
  flightId: z.string().uuid(),
});

export const deleteFlightSchema = z.object({
  id: z.string().uuid(),
});

export const addFlightSchema = z.object({
  tripId: z.string().uuid('Must be valid UUID').optional(),
  departureAirport: AirportSchema.nullable().refine(
    item => item !== null,
    'Airport is required.',
  ),
  arrivalAirport: AirportSchema.nullable().refine(
    item => item !== null,
    'Airport is required.',
  ),
  airline: AirlineSchema.nullable(),
  aircraftType: AircraftTypeSchema.nullable(),
  flightNumber: z
    .number()
    .int()
    .lte(9999, 'Must be 4 digits or less')
    .nullable(),
  airframe: AirframeSchema.extend({
    type: z.enum(['existing', 'custom']),
    operator: AirlineSchema.nullable(),
    aircraftType: AircraftTypeSchema.nullable(),
  }).nullable(),
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

export type GetProfileFiltersRequest = z.infer<typeof profileFiltersSchema>;

export type GetUserFlightsRequest = z.infer<typeof getUserFlightsSchema>;

export type GetUserProfileFlightsRequest = z.infer<
  typeof getUserProfileFlightsSchema
>;

export type GetUserMapDataRequest = z.infer<typeof getUserMapDataSchema>;

export type GetFlightRequest = z.infer<typeof getFlightSchema>;

export type AddFlightRequest = z.infer<typeof addFlightSchema>;

export type EditFlightRequest = z.infer<typeof editFlightSchema>;
