import { z } from 'zod';

export const flightPageSearchSchema = z.object({
  isFlightFocused: z.boolean().optional(),
});

export const userPageSearchSchema = z.object({
  isFlightsFullScreen: z.boolean().optional(),
  isStatsFullScreen: z.boolean().optional(),
  isMapFullScreen: z.boolean().optional(),
  selectedAirportId: z.string().optional(),
});

export const profilePageSearchSchema = userPageSearchSchema.extend({
  addFlight: z.boolean().optional(),
});
