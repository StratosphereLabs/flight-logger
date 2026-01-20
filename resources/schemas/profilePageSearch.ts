import { z } from 'zod';

export const profilePageSearchSchema = z.object({
  isFlightsFullScreen: z.boolean().optional(),
  isStatsFullScreen: z.boolean().optional(),
  isMapFullScreen: z.boolean().optional(),
  addFlight: z.boolean().optional(),
  selectedAirportId: z.string().optional(),
});
