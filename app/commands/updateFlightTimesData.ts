import type { Prisma } from '@prisma/client';
import { add, getTime, isAfter, parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

import { DATE_FORMAT_ISO } from '../constants';
import { fetchFlightAwareData } from '../data/flightAware';
import type { FlightAwareDataResult } from '../data/flightAware/types';
import { fetchFlightStatsData } from '../data/flightStats';
import type { FlightStatsFlight } from '../data/flightStats/types';
import { createNewDate } from '../data/utils';
import { prisma, updateTripTimes } from '../db';
import { getDurationMinutes } from '../utils';
import { KTS_TO_MPH } from './constants';
import type { FlightWithData } from './types';
import { updateFlightChangeData } from './updateFlightChangeData';
import { getGroupedFlightsKey } from './utils';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const getFlightAwareUpdatedData = (flight: FlightAwareDataResult) => {
  const outTime = createNewDate(flight.gateDepartureTimes.scheduled);
  const outTimeActual =
    flight.gateDepartureTimes.actual !== null
      ? createNewDate(flight.gateDepartureTimes.actual)
      : flight.gateDepartureTimes.estimated !== null
        ? createNewDate(flight.gateDepartureTimes.estimated)
        : null;
  const inTime = createNewDate(flight.gateArrivalTimes.scheduled);
  const inTimeActual =
    flight.gateArrivalTimes.actual !== null
      ? createNewDate(flight.gateArrivalTimes.actual)
      : flight.gateArrivalTimes.estimated !== null
        ? createNewDate(flight.gateArrivalTimes.estimated)
        : null;
  return {
    duration: getDurationMinutes({
      start: outTime,
      end: inTime,
    }),
    outTime,
    outTimeActual,
    inTime,
    inTimeActual,
    departureGate: flight.origin.gate ?? undefined,
    arrivalGate: flight.destination.gate ?? undefined,
    departureTerminal: flight.origin.terminal ?? undefined,
    arrivalTerminal: flight.destination.terminal ?? undefined,
    arrivalBaggage: undefined,
    tracklog:
      flight.track !== undefined
        ? (flight.track as Prisma.JsonArray)
        : undefined,
    waypoints:
      flight.waypoints !== undefined
        ? (flight.waypoints as Prisma.JsonArray)
        : undefined,
    flightAwareLink: flight.permaLink ?? undefined,
  };
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const getFlightStatsUpdatedData = (flight: FlightStatsFlight) => {
  const outTime = new Date(flight.schedule.scheduledDepartureUTC);
  const outTimeActual =
    flight.schedule.estimatedActualDepartureUTC !== null
      ? new Date(flight.schedule.estimatedActualDepartureUTC)
      : null;
  const inTime = new Date(flight.schedule.scheduledArrivalUTC);
  const inTimeActual =
    flight.schedule.estimatedActualArrivalUTC !== null
      ? new Date(flight.schedule.estimatedActualArrivalUTC)
      : null;
  return {
    duration: getDurationMinutes({
      start: outTime,
      end: inTime,
    }),
    outTime,
    outTimeActual,
    inTime,
    inTimeActual,
    departureGate: flight.departureAirport.gate ?? undefined,
    arrivalGate: flight.arrivalAirport.gate ?? undefined,
    departureTerminal: flight.departureAirport.terminal ?? undefined,
    arrivalTerminal: flight.arrivalAirport.terminal ?? undefined,
    arrivalBaggage: flight.arrivalAirport.baggage ?? undefined,
    tracklog:
      (flight.positional.flexTrack?.positions
        ?.reverse()
        .map(({ date, lat, lon, altitudeFt, speedMph }) => ({
          timestamp: Math.round(getTime(parseISO(date)) / 1000),
          coord: [lon, lat],
          alt: altitudeFt / 100,
          gs: Math.round((10 * speedMph) / KTS_TO_MPH) / 10,
        })) as Prisma.JsonArray | undefined) ?? undefined,
  };
};

export const updateFlightTimesData = async (
  flights: FlightWithData[],
): Promise<FlightWithData[] | null> => {
  if (flights[0].airline === null || flights[0].flightNumber === null) {
    console.error('Airline and flight number are required.');
    return null;
  }
  const isoDate = formatInTimeZone(
    flights[0].outTime,
    flights[0].departureAirport.timeZone,
    DATE_FORMAT_ISO,
  );
  const isWithinOneDay = isAfter(
    add(new Date(), { days: 1 }),
    flights[0].outTime,
  );
  if (process.env.FLIGHT_TIMES_DATASOURCE === 'flightaware') {
    const flightAwareResponse = await fetchFlightAwareData({
      airline: flights[0].airline,
      arrivalIata: flights[0].arrivalAirport.iata,
      departureIata: flights[0].departureAirport.iata,
      flightNumber: flights[0].flightNumber,
      isoDate,
      fetchTrackingData: isWithinOneDay,
    });
    if (flightAwareResponse === null) {
      console.error(
        `  Flight times data not found for ${getGroupedFlightsKey(
          flights[0],
        )}. Please try again later.`,
      );
      return null;
    }
    const updatedData = getFlightAwareUpdatedData(flightAwareResponse);
    const updatedFlights = await prisma.$transaction(
      flights.map(({ id }) =>
        prisma.flight.update({
          where: {
            id,
          },
          data: updatedData,
          include: {
            airline: true,
            departureAirport: {
              select: {
                id: true,
                iata: true,
                timeZone: true,
              },
            },
            arrivalAirport: {
              select: {
                id: true,
                iata: true,
                timeZone: true,
              },
            },
            diversionAirport: {
              select: {
                id: true,
                iata: true,
                timeZone: true,
              },
            },
          },
        }),
      ),
    );
    await updateFlightChangeData(flights, updatedData);
    await Promise.all(
      flights.flatMap(({ tripId }) =>
        tripId !== null ? updateTripTimes(tripId) : [],
      ),
    );
    return updatedFlights;
  } else if (process.env.FLIGHT_TIMES_DATASOURCE === 'flightstats') {
    const flightStatsResponse = await fetchFlightStatsData({
      airline: flights[0].airline,
      arrivalIata: flights[0].arrivalAirport.iata,
      departureIata: flights[0].departureAirport.iata,
      flightNumber: flights[0].flightNumber,
      isoDate,
    });
    if (flightStatsResponse === null) {
      console.error(
        `  Flight times data not found for ${getGroupedFlightsKey(
          flights[0],
        )}. Please try again later.`,
      );
      return null;
    }
    const updatedData = getFlightStatsUpdatedData(flightStatsResponse);
    const updatedFlights = await prisma.$transaction(
      flights.map(({ id }) =>
        prisma.flight.update({
          where: {
            id,
          },
          data: updatedData,
          include: {
            airline: true,
            departureAirport: {
              select: {
                id: true,
                iata: true,
                timeZone: true,
              },
            },
            arrivalAirport: {
              select: {
                id: true,
                iata: true,
                timeZone: true,
              },
            },
            diversionAirport: {
              select: {
                id: true,
                iata: true,
                timeZone: true,
              },
            },
          },
        }),
      ),
    );
    await updateFlightChangeData(flights, updatedData);
    await Promise.all(
      flights.flatMap(({ tripId }) =>
        tripId !== null ? updateTripTimes(tripId) : [],
      ),
    );
    return updatedFlights;
  }
  return null;
};
