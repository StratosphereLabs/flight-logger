/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { TRPCError } from '@trpc/server';
import { format } from 'date-fns';

import { DATE_FORMAT_ISO } from '../constants';
import { searchFlightRadarFlightsByFlightNumber } from '../data/flightRadar';
import { searchFlightStatsFlightsByFlightNumber } from '../data/flightStats';
import {
  getPendingFlightsForUser,
  syncCalendar,
  updateFlightData,
  updateFlightWeatherReports,
  updateOnTimePerformanceData,
  updateTrackAircraftData,
} from '../data/updaters';
import { prisma } from '../db';
import { verifyAuthenticated } from '../middleware';
import {
  addCalendarSourceSchema,
  approvePendingFlightSchema,
  bulkApprovePendingFlightsSchema,
  bulkRejectPendingFlightsSchema,
  deleteCalendarSourceSchema,
  getPendingFlightsSchema,
  rejectPendingFlightSchema,
  restorePendingFlightSchema,
  testCalendarSyncSchema,
  updateCalendarSourceSchema,
} from '../schemas/calendars';
import { procedure, router } from '../trpc';

export const calendarsRouter = router({
  // Get user's calendar sources
  getCalendarSources: procedure
    .use(verifyAuthenticated)
    .query(async ({ ctx }) => {
      return await prisma.calendarSource.findMany({
        where: { userId: ctx.user.id },
        orderBy: { createdAt: 'desc' },
      });
    }),

  // Add a new calendar source
  addCalendarSource: procedure
    .use(verifyAuthenticated)
    .input(addCalendarSourceSchema)
    .mutation(async ({ ctx, input }) => {
      // Check for duplicate URL
      const existing = await prisma.calendarSource.findFirst({
        where: {
          userId: ctx.user.id,
          url: input.url,
        },
      });

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Calendar source with this URL already exists',
        });
      }

      return await prisma.calendarSource.create({
        data: {
          userId: ctx.user.id,
          url: input.url,
          name: input.name,
        },
      });
    }),

  // Update calendar source
  updateCalendarSource: procedure
    .use(verifyAuthenticated)
    .input(updateCalendarSourceSchema)
    .mutation(async ({ ctx, input }) => {
      const calendar = await prisma.calendarSource.findFirst({
        where: {
          id: input.id,
          userId: ctx.user.id,
        },
      });

      if (!calendar) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Calendar source not found',
        });
      }

      return await prisma.calendarSource.update({
        where: { id: input.id },
        data: {
          name: input.name,
          enabled: input.enabled,
          autoImport: input.autoImport,
        },
      });
    }),

  // Delete calendar source
  deleteCalendarSource: procedure
    .use(verifyAuthenticated)
    .input(deleteCalendarSourceSchema)
    .mutation(async ({ ctx, input }) => {
      const calendar = await prisma.calendarSource.findFirst({
        where: {
          id: input.id,
          userId: ctx.user.id,
        },
      });

      if (!calendar) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Calendar source not found',
        });
      }

      await prisma.calendarSource.delete({
        where: { id: input.id },
      });
    }),

  // Test calendar sync
  testCalendarSync: procedure
    .use(verifyAuthenticated)
    .input(testCalendarSyncSchema)
    .mutation(async ({ ctx, input }) => {
      const calendar = await prisma.calendarSource.findFirst({
        where: {
          id: input.id,
          userId: ctx.user.id,
        },
      });

      if (calendar === null) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Calendar source not found',
        });
      }

      const calendarInfo = {
        id: calendar.id,
        userId: ctx.user.id,
        name: calendar.name,
        url: calendar.url,
        autoImport: calendar.autoImport,
      };

      // If auto-import is enabled, run sync in background and return immediately
      if (calendar.autoImport) {
        // Fire and forget - don't await
        void syncCalendar(calendarInfo);

        return {
          calendarId: calendar.id,
          calendarName: calendar.name,
          backgroundSync: true,
          message:
            'Sync started in background. You will be notified when complete.',
        };
      }

      // For non-auto-import calendars, sync synchronously and return results
      const result = await syncCalendar(calendarInfo);

      return result;
    }),

  // Get pending flights
  getPendingFlights: procedure
    .use(verifyAuthenticated)
    .input(getPendingFlightsSchema)
    .query(async ({ ctx, input }) => {
      const pendingFlights = await getPendingFlightsForUser(ctx.user.id);

      // Apply pagination
      const start = input.offset || 0;
      const limit = input.limit || 20;
      const end = start + limit;

      return {
        flights: pendingFlights.slice(start, end),
        total: pendingFlights.length,
        hasMore: end < pendingFlights.length,
      };
    }),

  // Approve pending flight (create actual flight)
  approvePendingFlight: procedure
    .use(verifyAuthenticated)
    .input(approvePendingFlightSchema)
    .mutation(async ({ ctx, input }) => {
      const pendingFlight = await prisma.pendingFlight.findFirst({
        where: {
          id: input.id,
          calendarSource: {
            userId: ctx.user.id,
          },
          status: 'PENDING',
        },
        include: {
          calendarSource: true,
        },
      });

      if (!pendingFlight) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Pending flight not found',
        });
      }

      // Get parsed data from calendar event
      const parsedData = pendingFlight.parsedData as any;
      const airlineCode = input.airlineId || parsedData.airline;
      const flightNumber = input.flightNumber || parsedData.flightNumber;
      const outTime = input.outTime || parsedData.outTime;

      // Look up airline first - we need this for API lookups
      const airline = airlineCode
        ? await prisma.airline.findFirst({
            where: {
              OR: [
                { iata: airlineCode },
                { icao: airlineCode },
                { id: airlineCode },
              ],
            },
          })
        : null;

      if (!airline) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Airline not found: ${airlineCode}`,
        });
      }

      if (!flightNumber) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Missing flight number',
        });
      }

      if (!outTime) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Missing departure time',
        });
      }

      // Get the date in ISO format for flight lookup
      const isoDate = format(new Date(outTime), DATE_FORMAT_ISO);

      // Try to look up the flight from external APIs to get accurate data
      let flightSearchResult = null;

      // Try FlightStats first
      try {
        const results = await searchFlightStatsFlightsByFlightNumber({
          airline,
          flightNumber,
          isoDate,
        });
        if (results.length > 0) {
          flightSearchResult = results[0];
        }
      } catch {
        // FlightStats lookup failed, will try FlightRadar
      }

      // Try FlightRadar if FlightStats didn't find it
      if (!flightSearchResult) {
        try {
          const results = await searchFlightRadarFlightsByFlightNumber({
            airline,
            flightNumber,
            isoDate,
          });
          if (results.length > 0) {
            flightSearchResult = results[0];
          }
        } catch {
          // FlightRadar lookup failed, will fall back to manual lookup
        }
      }

      // Determine final flight data
      let departureAirportId: string;
      let arrivalAirportId: string;
      let finalOutTime: Date;
      let finalInTime: Date;

      if (flightSearchResult) {
        // Use API data - this has proper airport IDs
        departureAirportId = flightSearchResult.departureAirport.id;
        arrivalAirportId = flightSearchResult.arrivalAirport.id;
        finalOutTime = flightSearchResult.outTime;
        finalInTime = flightSearchResult.inTime;
      } else {
        // Fall back to manual lookup from parsed data

        const departureCode =
          input.departureAirportId || parsedData.departureAirport;
        const arrivalCode = input.arrivalAirportId || parsedData.arrivalAirport;
        const inTime = input.inTime || parsedData.inTime;

        if (!departureCode || !arrivalCode) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message:
              'Could not find flight via API and missing airport codes in calendar data',
          });
        }

        const departureAirport = await prisma.airport.findFirst({
          where: { OR: [{ iata: departureCode }, { id: departureCode }] },
        });
        const arrivalAirport = await prisma.airport.findFirst({
          where: { OR: [{ iata: arrivalCode }, { id: arrivalCode }] },
        });

        if (!departureAirport) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Departure airport not found: ${departureCode}`,
          });
        }
        if (!arrivalAirport) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Arrival airport not found: ${arrivalCode}`,
          });
        }
        if (!inTime) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Missing arrival time',
          });
        }

        departureAirportId = departureAirport.id;
        arrivalAirportId = arrivalAirport.id;
        finalOutTime = new Date(outTime);
        finalInTime = new Date(inTime);
      }

      // Create the flight
      const flight = await prisma.flight.create({
        data: {
          userId: ctx.user.id,
          addedByUserId: ctx.user.id,
          airlineId: airline.id,
          flightNumber,
          departureAirportId,
          arrivalAirportId,
          outTime: finalOutTime,
          inTime: finalInTime,
          duration: Math.floor(
            (finalInTime.getTime() - finalOutTime.getTime()) / (1000 * 60),
          ),
        },
        include: {
          departureAirport: true,
          arrivalAirport: true,
          diversionAirport: true,
          airline: true,
        },
      });

      // Mark pending flight as approved
      await prisma.pendingFlight.update({
        where: { id: input.id },
        data: { status: 'APPROVED' },
      });

      // Trigger data updates
      const updatedFlights = await updateFlightData([flight]);
      await updateTrackAircraftData(updatedFlights);
      await updateOnTimePerformanceData(updatedFlights);
      await updateFlightWeatherReports(updatedFlights);

      return flight;
    }),

  // Reject pending flight
  rejectPendingFlight: procedure
    .use(verifyAuthenticated)
    .input(rejectPendingFlightSchema)
    .mutation(async ({ ctx, input }) => {
      const pendingFlight = await prisma.pendingFlight.findFirst({
        where: {
          id: input.id,
          calendarSource: {
            userId: ctx.user.id,
          },
          status: 'PENDING',
        },
      });

      if (!pendingFlight) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Pending flight not found',
        });
      }

      await prisma.pendingFlight.update({
        where: { id: input.id },
        data: { status: 'REJECTED' },
      });
    }),

  // Bulk approve pending flights
  bulkApprovePendingFlights: procedure
    .use(verifyAuthenticated)
    .input(bulkApprovePendingFlightsSchema)
    .mutation(async ({ ctx, input }) => {
      const results = [];

      for (const id of input.ids) {
        try {
          const pendingFlight = await prisma.pendingFlight.findFirst({
            where: {
              id,
              calendarSource: {
                userId: ctx.user.id,
              },
              status: 'PENDING',
            },
            include: {
              calendarSource: true,
            },
          });

          if (!pendingFlight) {
            results.push({ id, success: false, error: 'Not found' });
            continue;
          }

          const parsedData = pendingFlight.parsedData as any;

          // Look up airline by IATA or ICAO code - needed for API lookups
          const airlineCode = parsedData.airline;
          const airline = airlineCode
            ? await prisma.airline.findFirst({
                where: {
                  OR: [
                    { iata: airlineCode },
                    { icao: airlineCode },
                    { id: airlineCode },
                  ],
                },
              })
            : null;

          if (!airline) {
            results.push({
              id,
              success: false,
              error: `Airline not found: ${airlineCode}`,
            });
            continue;
          }

          const flightNumber = parsedData.flightNumber;
          const outTime = parsedData.outTime;

          if (!flightNumber) {
            results.push({
              id,
              success: false,
              error: 'Missing flight number',
            });
            continue;
          }

          if (!outTime) {
            results.push({
              id,
              success: false,
              error: 'Missing departure time',
            });
            continue;
          }

          // Get the date in ISO format for flight lookup
          const isoDate = format(new Date(outTime), DATE_FORMAT_ISO);

          // Try to look up the flight from external APIs to get accurate data
          let flightSearchResult = null;

          // Try FlightStats first
          try {
            const apiResults = await searchFlightStatsFlightsByFlightNumber({
              airline,
              flightNumber,
              isoDate,
            });
            if (apiResults.length > 0) {
              flightSearchResult = apiResults[0];
            }
          } catch {
            // FlightStats lookup failed, will try FlightRadar
          }

          // Try FlightRadar if FlightStats didn't find it
          if (!flightSearchResult) {
            try {
              const apiResults = await searchFlightRadarFlightsByFlightNumber({
                airline,
                flightNumber,
                isoDate,
              });
              if (apiResults.length > 0) {
                flightSearchResult = apiResults[0];
              }
            } catch {
              // FlightRadar lookup failed, will fall back to manual lookup
            }
          }

          // Determine final flight data
          let departureAirportId: string;
          let arrivalAirportId: string;
          let finalOutTime: Date;
          let finalInTime: Date;

          if (flightSearchResult) {
            // Use API data - this has proper airport IDs
            departureAirportId = flightSearchResult.departureAirport.id;
            arrivalAirportId = flightSearchResult.arrivalAirport.id;
            finalOutTime = flightSearchResult.outTime;
            finalInTime = flightSearchResult.inTime;
          } else {
            // Fall back to manual lookup from parsed data

            const departureCode = parsedData.departureAirport;
            const arrivalCode = parsedData.arrivalAirport;
            const inTime = parsedData.inTime;

            if (!departureCode || !arrivalCode) {
              results.push({
                id,
                success: false,
                error:
                  'Could not find flight via API and missing airport codes in calendar data',
              });
              continue;
            }

            const departureAirport = await prisma.airport.findFirst({
              where: { OR: [{ iata: departureCode }, { id: departureCode }] },
            });
            const arrivalAirport = await prisma.airport.findFirst({
              where: { OR: [{ iata: arrivalCode }, { id: arrivalCode }] },
            });

            if (!departureAirport) {
              results.push({
                id,
                success: false,
                error: `Departure airport not found: ${departureCode}`,
              });
              continue;
            }
            if (!arrivalAirport) {
              results.push({
                id,
                success: false,
                error: `Arrival airport not found: ${arrivalCode}`,
              });
              continue;
            }
            if (!inTime) {
              results.push({
                id,
                success: false,
                error: 'Missing arrival time',
              });
              continue;
            }

            departureAirportId = departureAirport.id;
            arrivalAirportId = arrivalAirport.id;
            finalOutTime = new Date(outTime);
            finalInTime = new Date(inTime);
          }

          // Create the flight
          const flight = await prisma.flight.create({
            data: {
              userId: ctx.user.id,
              addedByUserId: ctx.user.id,
              airlineId: airline.id,
              flightNumber,
              departureAirportId,
              arrivalAirportId,
              outTime: finalOutTime,
              inTime: finalInTime,
              duration: Math.floor(
                (finalInTime.getTime() - finalOutTime.getTime()) / (1000 * 60),
              ),
            },
            include: {
              departureAirport: true,
              arrivalAirport: true,
              diversionAirport: true,
              airline: true,
            },
          });

          await prisma.pendingFlight.update({
            where: { id },
            data: { status: 'APPROVED' },
          });

          // Trigger updates for the flight
          const updatedFlights = await updateFlightData([flight]);
          await updateTrackAircraftData(updatedFlights);
          await updateOnTimePerformanceData(updatedFlights);
          await updateFlightWeatherReports(updatedFlights);

          results.push({ id, success: true, flightId: flight.id });
        } catch (error) {
          results.push({
            id,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      return results;
    }),

  // Bulk reject pending flights
  bulkRejectPendingFlights: procedure
    .use(verifyAuthenticated)
    .input(bulkRejectPendingFlightsSchema)
    .mutation(async ({ ctx, input }) => {
      await prisma.pendingFlight.updateMany({
        where: {
          id: { in: input.ids },
          calendarSource: {
            userId: ctx.user.id,
          },
          status: 'PENDING',
        },
        data: { status: 'REJECTED' },
      });

      return { updated: input.ids.length };
    }),

  // Restore a rejected pending flight (set status back to PENDING)
  restorePendingFlight: procedure
    .use(verifyAuthenticated)
    .input(restorePendingFlightSchema)
    .mutation(async ({ ctx, input }) => {
      const pendingFlight = await prisma.pendingFlight.findFirst({
        where: {
          id: input.id,
          calendarSource: {
            userId: ctx.user.id,
          },
          status: 'REJECTED',
        },
      });

      if (!pendingFlight) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Rejected pending flight not found',
        });
      }

      // Reset expiration date and set status back to PENDING
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      await prisma.pendingFlight.update({
        where: { id: input.id },
        data: {
          status: 'PENDING',
          expiresAt,
        },
      });

      return { success: true };
    }),
});
