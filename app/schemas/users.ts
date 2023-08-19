import { z } from 'zod';

export const getUserSchema = z.object({
  username: z.string().trim().optional(),
});

export const getUserFlightsSchema = getUserSchema.extend({
  withTrip: z.boolean().optional(),
  layout: z.enum(['full', 'compact']),
});

export const getUsersSchema = z.object({
  query: z.string(),
});

export type GetUserRequest = z.infer<typeof getUserSchema>;
