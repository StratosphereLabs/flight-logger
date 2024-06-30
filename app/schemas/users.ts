import { isValid, parseISO } from 'date-fns';
import { z } from 'zod';
import { paginationSchema } from './pagination';

export const getUserSchema = z.object({
  username: z.string().trim().optional(),
});

export const getUserFlightsSchema = getUserSchema.extend({
  withTrip: z.boolean().optional(),
  layout: z.enum(['full', 'compact']),
});

export const getUserProfileFlightsSchema = paginationSchema.extend(
  getUserSchema.shape,
);

export const profileFiltersSchema = z.object({
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

export const getUserMapDataSchema = getUserSchema.extend(
  profileFiltersSchema.shape,
);

export const getUsersSchema = z.object({
  query: z.string(),
  followingUsersOnly: z.boolean().optional(),
});

export const selectUserSchema = z.object({
  username: z
    .string()
    .nullable()
    .refine(item => item !== null, 'User is required.'),
});

export const setFCMTokenSchema = z.object({
  token: z.string(),
});

export const togglePushNotificationsSchema = z.object({
  enabled: z.boolean(),
});

export const addFollowerSchema = z.object({
  username: z.string().trim(),
});

export type GetUserRequest = z.infer<typeof getUserSchema>;

export type GetUserFlightsRequest = z.infer<typeof getUserFlightsSchema>;

export type GetUserProfileFlightsRequest = z.infer<
  typeof getUserProfileFlightsSchema
>;

export type GetProfileFiltersRequest = z.infer<typeof profileFiltersSchema>;

export type GetUserMapDataRequest = z.infer<typeof getUserMapDataSchema>;

export type UserSelectFormData = z.infer<typeof selectUserSchema>;
