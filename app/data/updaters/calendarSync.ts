import { randomUUID } from 'crypto';
import { addDays, format, subDays } from 'date-fns';

import { DATE_FORMAT_ISO } from '../../constants';
import { prisma } from '../../db';
import {
  type FlightData,
  type ParsedFlightEvent,
  extractFlightData,
  fetchCalendar,
  filterFutureEvents,
  isFlightEvent,
} from '../../utils/ical';
import {
  sendCalendarSyncNotification,
  sendCalendarSyncStartNotification,
} from '../../utils/pushNotifications';
import { searchFlightRadarFlightsByFlightNumber } from '../flightRadar';
import { searchFlightStatsFlightsByFlightNumber } from '../flightStats';
import {
  updateFlightData,
  updateFlightWeatherReports,
  updateOnTimePerformanceData,
  updateTrackAircraftData,
} from './index';

export interface SyncResult {
  calendarId: string;
  calendarName: string;
  totalEventsFound: number;
  totalFutureEvents: number;
  totalFutureFlights: number;
  newPendingFlights: number;
  autoImportedFlights: number;
  autoImportFailures: number;
  skippedAlreadyPending: number;
  skippedAlreadyImported: number;
  skippedRecentlyRejected: number;
  errors: string[];
  detectedFlights: Array<{
    summary: string;
    airline?: string;
    flightNumber?: number;
    departure?: string;
    arrival?: string;
    date?: string;
    status: string;
    pendingFlightId?: string; // ID of the pending flight record (for rejected flights that can be restored)
  }>;
}

interface CalendarSourceInfo {
  id: string;
  userId: number;
  name: string;
  url: string;
  autoImport: boolean;
}

interface DuplicateCheckResult {
  isDuplicate: boolean;
  reason: string;
}

const REJECTED_COOLING_PERIOD_DAYS = 30;

/**
 * Sync all enabled calendars for a user
 */
export async function syncCalendarsForUser(
  userId: number,
): Promise<SyncResult[]> {
  const calendars = await prisma.calendarSource.findMany({
    where: {
      userId,
      enabled: true,
    },
  });

  const results: SyncResult[] = [];

  for (const calendar of calendars) {
    try {
      const result = await syncCalendar({
        id: calendar.id,
        userId: calendar.userId,
        name: calendar.name,
        url: calendar.url,
        autoImport: calendar.autoImport,
      });
      results.push(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      results.push({
        calendarId: calendar.id,
        calendarName: calendar.name,
        totalEventsFound: 0,
        totalFutureEvents: 0,
        totalFutureFlights: 0,
        newPendingFlights: 0,
        autoImportedFlights: 0,
        autoImportFailures: 0,
        skippedAlreadyPending: 0,
        skippedAlreadyImported: 0,
        skippedRecentlyRejected: 0,
        errors: [`Sync failed: ${message}`],
        detectedFlights: [],
      });
    }
  }

  return results;
}

/**
 * Sync a single calendar
 */
export async function syncCalendar(
  calendar: CalendarSourceInfo,
): Promise<SyncResult> {
  const result: SyncResult = {
    calendarId: calendar.id,
    calendarName: calendar.name,
    totalEventsFound: 0,
    totalFutureEvents: 0,
    totalFutureFlights: 0,
    newPendingFlights: 0,
    autoImportedFlights: 0,
    autoImportFailures: 0,
    skippedAlreadyPending: 0,
    skippedAlreadyImported: 0,
    skippedRecentlyRejected: 0,
    errors: [],
    detectedFlights: [],
  };

  try {
    // Fetch and parse calendar
    console.log(`[CalendarSync] Fetching calendar: ${calendar.name}`);
    const events = await fetchCalendar(calendar.url);
    result.totalEventsFound = events.length;
    console.log(`[CalendarSync] Found ${events.length} total events`);

    // Filter to future events
    const futureEvents = filterFutureEvents(events);
    result.totalFutureEvents = futureEvents.length;
    console.log(`[CalendarSync] Found ${futureEvents.length} future events`);

    // Filter to flight events
    const flightEvents = futureEvents.filter(isFlightEvent);
    result.totalFutureFlights = flightEvents.length;
    console.log(
      `[CalendarSync] Found ${flightEvents.length} future flight events`,
    );

    // Send "starting import" notification for auto-import calendars when flights are detected
    if (calendar.autoImport && flightEvents.length > 0) {
      console.log(
        `[CalendarSync] Sending start notification for ${flightEvents.length} flights`,
      );
      await sendCalendarSyncStartNotification(
        calendar.userId,
        calendar.name,
        flightEvents.length,
      );
    }

    // Process each flight event
    for (const event of flightEvents) {
      try {
        const flightData = extractFlightData(event);
        const processResult = await processFlightEvent(calendar, event);

        const flightInfo = {
          summary: event.summary,
          airline: flightData.airline,
          flightNumber: flightData.flightNumber,
          departure: flightData.departureAirport,
          arrival: flightData.arrivalAirport,
          date: flightData.outTime?.toISOString().split('T')[0],
          status: processResult.status,
          pendingFlightId: processResult.pendingFlightId,
        };

        result.detectedFlights.push(flightInfo);
        console.log(
          `[CalendarSync] Processed flight: ${flightData.airline ?? '??'}${flightData.flightNumber ?? '?'} ${flightData.departureAirport ?? '???'}-${flightData.arrivalAirport ?? '???'} -> ${processResult.status}`,
        );

        switch (processResult.status) {
          case 'created':
            result.newPendingFlights++;
            break;
          case 'auto_imported':
            result.autoImportedFlights++;
            break;
          case 'auto_import_failed':
            result.autoImportFailures++;
            result.newPendingFlights++; // Also count as pending since it falls back
            if (
              processResult.error !== undefined &&
              processResult.error !== ''
            ) {
              result.errors.push(processResult.error);
            }
            break;
          case 'already_pending':
            result.skippedAlreadyPending++;
            break;
          case 'already_imported':
            result.skippedAlreadyImported++;
            break;
          case 'recently_rejected':
            result.skippedRecentlyRejected++;
            break;
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        result.errors.push(`Failed to process event ${event.uid}: ${message}`);
        console.error(`[CalendarSync] Error processing event:`, error);
      }
    }

    // Update last sync timestamp
    await prisma.calendarSource.update({
      where: { id: calendar.id },
      data: { lastSyncAt: new Date() },
    });

    // Send notifications for auto-import calendars when there's something to report
    if (
      calendar.autoImport &&
      (result.autoImportedFlights > 0 || result.autoImportFailures > 0)
    ) {
      // Create in-app notification
      let description: string;
      let color: 'SUCCESS' | 'WARNING';

      if (result.autoImportedFlights > 0 && result.autoImportFailures === 0) {
        const flightWord =
          result.autoImportedFlights === 1 ? 'flight' : 'flights';
        description = `Successfully imported ${result.autoImportedFlights} ${flightWord} from "${calendar.name}".`;
        color = 'SUCCESS';
      } else if (
        result.autoImportedFlights === 0 &&
        result.autoImportFailures > 0
      ) {
        const flightWord =
          result.autoImportFailures === 1 ? 'flight' : 'flights';
        description = `${result.autoImportFailures} ${flightWord} from "${calendar.name}" could not be auto-imported and require manual review.`;
        color = 'WARNING';
      } else {
        const importedWord =
          result.autoImportedFlights === 1 ? 'flight' : 'flights';
        const failureWord =
          result.autoImportFailures === 1 ? 'flight' : 'flights';
        description = `Imported ${result.autoImportedFlights} ${importedWord} from "${calendar.name}". ${result.autoImportFailures} ${failureWord} require manual review.`;
        color = 'WARNING';
      }

      await prisma.notification.create({
        data: {
          id: randomUUID(),
          userId: calendar.userId,
          showDefault: true,
          color,
          title:
            result.autoImportedFlights > 0
              ? 'Flights imported from calendar'
              : 'Flights need review',
          description,
          expiration: addDays(new Date(), 7),
        },
      });

      // Send real-time push notification
      console.log(
        `[CalendarSync] Sending push notification to user ${calendar.userId} for calendar "${calendar.name}"`,
      );
      const pushResult = await sendCalendarSyncNotification(
        calendar.userId,
        calendar.name,
        result.autoImportedFlights,
        result.autoImportFailures,
      );
      console.log(`[CalendarSync] Push notification result:`, pushResult);
    }

    console.log(`[CalendarSync] Sync complete for ${calendar.name}:`, {
      totalFutureFlights: result.totalFutureFlights,
      newPendingFlights: result.newPendingFlights,
      autoImportedFlights: result.autoImportedFlights,
      autoImportFailures: result.autoImportFailures,
      skippedAlreadyPending: result.skippedAlreadyPending,
      skippedAlreadyImported: result.skippedAlreadyImported,
      skippedRecentlyRejected: result.skippedRecentlyRejected,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    result.errors.push(`Calendar sync failed: ${message}`);
    console.error(`[CalendarSync] Sync failed for ${calendar.name}:`, error);
  }

  return result;
}

interface ProcessResult {
  status:
    | 'created'
    | 'already_pending'
    | 'already_imported'
    | 'recently_rejected'
    | 'auto_imported'
    | 'auto_import_failed';
  pendingFlightId?: string; // ID of the rejected pending flight (for restore functionality)
  error?: string; // Error message for auto-import failures
}

/**
 * Process a single flight event and create pending flight if not duplicate
 * If autoImport is enabled, directly create the flight instead of pending
 */
async function processFlightEvent(
  calendar: CalendarSourceInfo,
  event: ParsedFlightEvent,
): Promise<ProcessResult> {
  // Check for existing pending flight with same event UID (pending or approved)
  const existingPending = await prisma.pendingFlight.findFirst({
    where: {
      calendarSourceId: calendar.id,
      eventUid: event.uid,
      status: { in: ['PENDING', 'APPROVED'] },
    },
  });

  if (existingPending !== null) {
    return { status: 'already_pending' };
  }

  // Check for recently rejected flight (within cooling period)
  const rejectedFlightId = await checkRecentlyRejected(calendar.id, event.uid);
  if (rejectedFlightId !== null) {
    return { status: 'recently_rejected', pendingFlightId: rejectedFlightId };
  }

  // Extract flight data
  const flightData = extractFlightData(event);

  // Check for existing flight in user's flight log
  const duplicateCheck = await checkForExistingFlight(
    calendar.userId,
    flightData,
  );

  if (duplicateCheck.isDuplicate) {
    return { status: 'already_imported' };
  }

  // If auto-import is enabled, try to create the flight directly
  if (calendar.autoImport) {
    return await autoImportFlight(calendar, event, flightData);
  }

  // Create pending flight (normal flow)
  const expiresAt = addDays(new Date(), 30);

  await prisma.pendingFlight.create({
    data: {
      calendarSourceId: calendar.id,
      eventUid: event.uid,
      eventData: JSON.parse(JSON.stringify(event.rawEvent)) as object,
      parsedData: JSON.parse(JSON.stringify(flightData)) as object,
      expiresAt,
    },
  });

  return { status: 'created' };
}

/**
 * Auto-import a flight directly without creating a pending flight
 * Uses the same API lookup logic as the approve mutation
 */
async function autoImportFlight(
  calendar: CalendarSourceInfo,
  event: ParsedFlightEvent,
  flightData: FlightData,
): Promise<ProcessResult> {
  try {
    const airlineCode = flightData.airline;
    const flightNumber = flightData.flightNumber;
    const outTime = flightData.outTime;

    // Look up airline - we need this for API lookups
    const airline =
      airlineCode !== undefined && airlineCode !== ''
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

    if (airline === null) {
      return await createPendingFlightAsFallback(
        calendar,
        event,
        flightData,
        `Airline not found: ${airlineCode}`,
      );
    }

    if (flightNumber === undefined || flightNumber === 0) {
      return await createPendingFlightAsFallback(
        calendar,
        event,
        flightData,
        'Missing flight number',
      );
    }

    if (outTime === undefined) {
      return await createPendingFlightAsFallback(
        calendar,
        event,
        flightData,
        'Missing departure time',
      );
    }

    // Get the date in ISO format for flight lookup
    const isoDate = format(outTime, DATE_FORMAT_ISO);

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
    if (flightSearchResult === null) {
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

    if (flightSearchResult !== null) {
      // Use API data - this has proper airport IDs
      departureAirportId = flightSearchResult.departureAirport.id;
      arrivalAirportId = flightSearchResult.arrivalAirport.id;
      finalOutTime = flightSearchResult.outTime;
      finalInTime = flightSearchResult.inTime;
    } else {
      // Fall back to manual lookup from parsed data
      const departureCode = flightData.departureAirport;
      const arrivalCode = flightData.arrivalAirport;
      const inTime = flightData.inTime;

      if (
        departureCode === undefined ||
        departureCode === '' ||
        arrivalCode === undefined ||
        arrivalCode === ''
      ) {
        return await createPendingFlightAsFallback(
          calendar,
          event,
          flightData,
          'Could not find flight via API and missing airport codes',
        );
      }

      const departureAirport = await prisma.airport.findFirst({
        where: { OR: [{ iata: departureCode }, { id: departureCode }] },
      });
      const arrivalAirport = await prisma.airport.findFirst({
        where: { OR: [{ iata: arrivalCode }, { id: arrivalCode }] },
      });

      if (departureAirport === null) {
        return await createPendingFlightAsFallback(
          calendar,
          event,
          flightData,
          `Departure airport not found: ${departureCode}`,
        );
      }
      if (arrivalAirport === null) {
        return await createPendingFlightAsFallback(
          calendar,
          event,
          flightData,
          `Arrival airport not found: ${arrivalCode}`,
        );
      }
      if (inTime === undefined) {
        return await createPendingFlightAsFallback(
          calendar,
          event,
          flightData,
          'Missing arrival time',
        );
      }

      departureAirportId = departureAirport.id;
      arrivalAirportId = arrivalAirport.id;
      finalOutTime = outTime;
      finalInTime = inTime;
    }

    // Create the flight
    const flight = await prisma.flight.create({
      data: {
        userId: calendar.userId,
        addedByUserId: calendar.userId,
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

    // Mark as approved by creating a pending flight record with APPROVED status
    // This prevents re-syncing the same event
    const expiresAt = addDays(new Date(), 30);
    await prisma.pendingFlight.create({
      data: {
        calendarSourceId: calendar.id,
        eventUid: event.uid,
        eventData: JSON.parse(JSON.stringify(event.rawEvent)) as object,
        parsedData: JSON.parse(JSON.stringify(flightData)) as object,
        expiresAt,
        status: 'APPROVED',
      },
    });

    // Trigger data updates
    const updatedFlights = await updateFlightData([flight]);
    await updateTrackAircraftData(updatedFlights);
    await updateOnTimePerformanceData(updatedFlights);
    await updateFlightWeatherReports(updatedFlights);

    return { status: 'auto_imported' };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return await createPendingFlightAsFallback(
      calendar,
      event,
      flightData,
      `Auto-import error: ${message}`,
    );
  }
}

/**
 * Create a pending flight as fallback when auto-import fails
 * Also creates a notification for the user
 */
async function createPendingFlightAsFallback(
  calendar: CalendarSourceInfo,
  event: ParsedFlightEvent,
  flightData: FlightData,
  errorMessage: string,
): Promise<ProcessResult> {
  // Create the pending flight for manual review
  const expiresAt = addDays(new Date(), 30);

  await prisma.pendingFlight.create({
    data: {
      calendarSourceId: calendar.id,
      eventUid: event.uid,
      eventData: JSON.parse(JSON.stringify(event.rawEvent)) as object,
      parsedData: JSON.parse(JSON.stringify(flightData)) as object,
      expiresAt,
    },
  });

  // Create a notification for the user about the failed auto-import
  const flightDescription = `${flightData.airline ?? '??'}${flightData.flightNumber ?? '?'} ${flightData.departureAirport ?? '???'}-${flightData.arrivalAirport ?? '???'}`;

  await prisma.notification.create({
    data: {
      id: randomUUID(),
      userId: calendar.userId,
      showDefault: true,
      color: 'WARNING',
      title: 'Flight auto-import failed',
      description: `Could not auto-import ${flightDescription}: ${errorMessage}. The flight has been added to your pending flights for manual review.`,
      expiration: addDays(new Date(), 7),
    },
  });

  return {
    status: 'auto_import_failed',
    error: errorMessage,
  };
}

/**
 * Check if a flight was recently rejected (within cooling period)
 * Returns the pending flight ID if found, null otherwise
 */
async function checkRecentlyRejected(
  calendarId: string,
  eventUid: string,
): Promise<string | null> {
  const cutoffDate = subDays(new Date(), REJECTED_COOLING_PERIOD_DAYS);

  const recentlyRejected = await prisma.pendingFlight.findFirst({
    where: {
      calendarSourceId: calendarId,
      eventUid,
      status: 'REJECTED',
      updatedAt: { gte: cutoffDate },
    },
  });

  return recentlyRejected?.id ?? null;
}

/**
 * Multi-tier duplicate detection - check if user already has a matching flight
 *
 * Detection methods (in order of specificity):
 * 1. Exact match: airline + flight number + same day
 * 2. Route match: departure + arrival airports + same day
 */
async function checkForExistingFlight(
  userId: number,
  flightData: FlightData,
): Promise<DuplicateCheckResult> {
  const outTime = flightData.outTime;

  if (outTime === undefined) {
    return { isDuplicate: false, reason: '' };
  }

  // Method 1: Exact match - airline + flight number + same day
  const hasAirline =
    flightData.airline !== undefined && flightData.airline !== '';
  const hasFlightNumber =
    flightData.flightNumber !== undefined && flightData.flightNumber !== 0;

  if (hasAirline && hasFlightNumber) {
    const airline = await prisma.airline.findFirst({
      where: {
        OR: [{ icao: flightData.airline }, { iata: flightData.airline }],
      },
    });

    if (airline !== null) {
      const startOfDay = new Date(outTime);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(outTime);
      endOfDay.setHours(23, 59, 59, 999);

      const exactMatch = await prisma.flight.findFirst({
        where: {
          userId,
          airlineId: airline.id,
          flightNumber: flightData.flightNumber,
          outTime: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      if (exactMatch !== null) {
        return {
          isDuplicate: true,
          reason: `Exact match: ${airline.iata ?? airline.icao}${flightData.flightNumber} on same day`,
        };
      }
    }
  }

  // Method 2: Route match - departure + arrival airports + same day
  const hasDepartureAirport =
    flightData.departureAirport !== undefined &&
    flightData.departureAirport !== '';
  const hasArrivalAirport =
    flightData.arrivalAirport !== undefined && flightData.arrivalAirport !== '';

  if (hasDepartureAirport && hasArrivalAirport) {
    // Look up airports by IATA or ICAO code
    const departureAirport = await prisma.airport.findFirst({
      where: {
        OR: [
          { iata: flightData.departureAirport },
          { id: flightData.departureAirport },
        ],
      },
    });

    const arrivalAirport = await prisma.airport.findFirst({
      where: {
        OR: [
          { iata: flightData.arrivalAirport },
          { id: flightData.arrivalAirport },
        ],
      },
    });

    if (departureAirport !== null && arrivalAirport !== null) {
      const startOfDay = new Date(outTime);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(outTime);
      endOfDay.setHours(23, 59, 59, 999);

      const routeMatch = await prisma.flight.findFirst({
        where: {
          userId,
          departureAirportId: departureAirport.id,
          arrivalAirportId: arrivalAirport.id,
          outTime: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      if (routeMatch !== null) {
        return {
          isDuplicate: true,
          reason: `Route match: ${flightData.departureAirport}-${flightData.arrivalAirport} on same day`,
        };
      }
    }
  }

  return { isDuplicate: false, reason: '' };
}

/**
 * Clean up expired pending flights
 */
export async function cleanupExpiredPendingFlights(): Promise<number> {
  const expired = await prisma.pendingFlight.updateMany({
    where: {
      expiresAt: { lt: new Date() },
      status: 'PENDING',
    },
    data: {
      status: 'EXPIRED',
    },
  });

  return expired.count;
}

/**
 * Get pending flights for a user
 */
export async function getPendingFlightsForUser(userId: number): Promise<
  Array<{
    id: string;
    calendarSourceId: string;
    eventUid: string;
    eventData: unknown;
    parsedData: unknown;
    detectedAt: Date;
    status: string;
    expiresAt: Date;
    createdAt: Date;
    calendarSource: {
      name: string;
      url: string;
    };
  }>
> {
  return await prisma.pendingFlight.findMany({
    where: {
      calendarSource: {
        userId,
      },
      status: 'PENDING',
    },
    include: {
      calendarSource: {
        select: {
          name: true,
          url: true,
        },
      },
    },
    orderBy: {
      detectedAt: 'desc',
    },
  });
}

/**
 * Sync all calendars for all users (for scheduled job)
 */
export async function syncAllCalendars(): Promise<void> {
  console.log('[CalendarSync] Starting scheduled sync for all calendars');

  const usersWithCalendars = await prisma.user.findMany({
    where: {
      calendarSources: {
        some: {
          enabled: true,
        },
      },
    },
    select: {
      id: true,
    },
  });

  console.log(
    `[CalendarSync] Found ${usersWithCalendars.length} users with enabled calendars`,
  );

  for (const user of usersWithCalendars) {
    try {
      await syncCalendarsForUser(user.id);
    } catch (error) {
      console.error(`Failed to sync calendars for user ${user.id}:`, error);
    }
  }

  console.log('[CalendarSync] Completed scheduled sync for all calendars');
}

/**
 * Sync only auto-import calendars (for more frequent scheduled job)
 * This runs more frequently to catch flight updates closer to real-time
 */
export async function syncAutoImportCalendars(): Promise<void> {
  console.log(
    '[CalendarSync] Starting scheduled sync for auto-import calendars',
  );

  const autoImportCalendars = await prisma.calendarSource.findMany({
    where: {
      enabled: true,
      autoImport: true,
    },
    select: {
      id: true,
      userId: true,
      name: true,
      url: true,
      autoImport: true,
    },
  });

  console.log(
    `[CalendarSync] Found ${autoImportCalendars.length} auto-import calendars`,
  );

  for (const calendar of autoImportCalendars) {
    try {
      await syncCalendar(calendar);
    } catch (error) {
      console.error(
        `[CalendarSync] Failed to sync auto-import calendar ${calendar.name}:`,
        error,
      );
    }
  }

  console.log(
    '[CalendarSync] Completed scheduled sync for auto-import calendars',
  );
}
