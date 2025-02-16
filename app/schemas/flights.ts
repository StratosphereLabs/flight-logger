import { isValid, parseISO } from 'date-fns';
import { z } from 'zod';

import {
  AircraftTypeSchema,
  AirframeSchema,
  AirlineSchema,
  AirportSchema,
} from '../../prisma/generated/zod';
import { TIME_REGEX_24H } from '../constants';
import { searchFlightDataSchema } from './flightData';
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
  searchQuery: z.string().trim(),
});

export const getUserFlightsSchema = getUserSchema
  .extend(paginationSchema.shape)
  .extend(profileFiltersSchema.shape)
  .extend({
    withTrip: z.boolean().optional(),
    selectedAirportId: z.string().nullable(),
  });

export const getUserProfileFlightsSchema = paginationSchema
  .extend(getUserSchema.shape)
  .extend(profileFiltersSchema.shape)
  .extend({
    selectedAirportId: z.string().nullable(),
  });

export const getUserProfileStatisticsSchema = getUserSchema
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

export const addFlightSchema = searchFlightDataSchema.extend({
  username: z.string().optional(),
  departureAirport: AirportSchema.nullable().refine(
    item => item !== null,
    'Airport is required.',
  ),
  arrivalAirport: AirportSchema.nullable().refine(
    item => item !== null,
    'Airport is required.',
  ),
  aircraftType: AircraftTypeSchema.nullable(),
  airframe: AirframeSchema.extend({
    type: z.enum(['existing', 'custom']),
    operator: AirlineSchema.nullable(),
    aircraftType: AircraftTypeSchema.nullable(),
  }).nullable(),
  outTimeValue: z
    .string()
    .min(1, 'Required')
    .regex(TIME_REGEX_24H, 'Invalid Time'),
  inTimeValue: z
    .string()
    .min(1, 'Required')
    .regex(TIME_REGEX_24H, 'Invalid Time'),
  seatNumber: z.string().trim(),
  seatPosition: z.enum(['AISLE', 'MIDDLE', 'WINDOW']).nullable(),
  class: z
    .enum(['BASIC', 'ECONOMY', 'PREMIUM', 'BUSINESS', 'FIRST'])
    .nullable(),
  reason: z.enum(['BUSINESS', 'LEISURE', 'CREW']).nullable(),
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
