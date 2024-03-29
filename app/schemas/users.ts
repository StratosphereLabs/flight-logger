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

export const getUsersSchema = z.object({
  query: z.string(),
});

export const addFollowerSchema = z.object({
  username: z.string().trim(),
});

export type GetUserRequest = z.infer<typeof getUserSchema>;

export type GetUserFlightsRequest = z.infer<typeof getUserFlightsSchema>;

export type GetUserProfileFlightsRequest = z.infer<
  typeof getUserProfileFlightsSchema
>;
