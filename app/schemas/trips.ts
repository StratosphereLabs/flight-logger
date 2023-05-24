import { z } from 'zod';

export const getTripSchema = z.object({
  id: z.string().uuid(),
});

export const createTripSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  flightIds: z.array(z.string().uuid()),
});

export const deleteTripSchema = z.object({
  id: z.string().uuid(),
});

export const editTripSchema = createTripSchema.extend({
  id: z.string().uuid('Must be a valid UUID'),
});

export const createTripFormSchema = z.object({
  tripName: z.string().min(1, 'Name is required.'),
});

export type GetTripRequest = z.infer<typeof getTripSchema>;

export type CreateTripRequest = z.infer<typeof createTripSchema>;

export type CreateTripForm = z.infer<typeof createTripFormSchema>;
