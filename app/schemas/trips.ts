import { z } from 'zod';

export const getTripSchema = z.object({
  id: z.string().uuid(),
});

export type GetTripRequest = z.infer<typeof getTripSchema>;
