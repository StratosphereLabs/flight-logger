import { z } from 'zod';

export const flightPageSearchSchema = z.object({
  isFlightFocused: z.boolean().optional(),
});
