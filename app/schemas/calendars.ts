import { z } from 'zod';

export const addCalendarSourceSchema = z.object({
  url: z.string().url('Must be a valid URL'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
});

export const updateCalendarSourceSchema = z.object({
  id: z.string().uuid('Must be a valid UUID'),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name too long')
    .optional(),
  enabled: z.boolean().optional(),
  autoImport: z.boolean().optional(),
});

export const deleteCalendarSourceSchema = z.object({
  id: z.string().uuid('Must be a valid UUID'),
});

export const testCalendarSyncSchema = z.object({
  id: z.string().uuid('Must be a valid UUID'),
});

export const getPendingFlightsSchema = z.object({
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0),
});

export const approvePendingFlightSchema = z.object({
  id: z.string().uuid('Must be a valid UUID'),
  // Optional fields for editing flight data before approval
  airlineId: z.string().uuid().optional(),
  flightNumber: z.number().int().positive().optional(),
  departureAirportId: z.string().optional(),
  arrivalAirportId: z.string().optional(),
  outTime: z.string().datetime().optional(),
  inTime: z.string().datetime().optional(),
});

export const rejectPendingFlightSchema = z.object({
  id: z.string().uuid('Must be a valid UUID'),
});

export const bulkApprovePendingFlightsSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, 'At least one flight required'),
});

export const bulkRejectPendingFlightsSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, 'At least one flight required'),
});

export const restorePendingFlightSchema = z.object({
  id: z.string().uuid('Must be a valid UUID'),
});

export type AddCalendarSourceRequest = z.infer<typeof addCalendarSourceSchema>;
export type UpdateCalendarSourceRequest = z.infer<
  typeof updateCalendarSourceSchema
>;
export type DeleteCalendarSourceRequest = z.infer<
  typeof deleteCalendarSourceSchema
>;
export type TestCalendarSyncRequest = z.infer<typeof testCalendarSyncSchema>;
export type GetPendingFlightsRequest = z.infer<typeof getPendingFlightsSchema>;
export type ApprovePendingFlightRequest = z.infer<
  typeof approvePendingFlightSchema
>;
export type RejectPendingFlightRequest = z.infer<
  typeof rejectPendingFlightSchema
>;
export type BulkApprovePendingFlightsRequest = z.infer<
  typeof bulkApprovePendingFlightsSchema
>;
export type BulkRejectPendingFlightsRequest = z.infer<
  typeof bulkRejectPendingFlightsSchema
>;
export type RestorePendingFlightRequest = z.infer<
  typeof restorePendingFlightSchema
>;
