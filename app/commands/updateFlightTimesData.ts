import type { Prisma } from '@prisma/client';
import { add, getTime, isAfter, parseISO, sub } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

import { DATE_FORMAT_ISO } from '../constants';
import { fetchFlightAwareData } from '../data/flightAware';
import type { FlightAwareDataResult } from '../data/flightAware/types';
import { fetchFlightStatsData } from '../data/flightStats';
import type { FlightStatsFlight } from '../data/flightStats/types';
import { createNewDate } from '../data/utils';
import { prisma, updateTripTimes } from '../db';
import { getAirframe, getDurationMinutes } from '../utils';
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
    tracklog: flight.track as Prisma.JsonArray | undefined,
    waypoints: flight.waypoints as Prisma.JsonArray | undefined,
    flightAwareLink: flight.permaLink ?? undefined,
  };
};

export const getFlightStatsUpdatedData = async (
  flight: FlightStatsFlight,
  prevTailNumber: string | null,
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
) => {
  const outTime =
    flight.schedule.scheduledDepartureUTC !== null
      ? new Date(flight.schedule.scheduledDepartureUTC)
      : undefined;
  const outTimeActual =
    flight.schedule.estimatedActualDepartureUTC !== null
      ? new Date(flight.schedule.estimatedActualDepartureUTC)
      : null;
  const offTime =
    outTime !== undefined ? add(outTime, { minutes: 10 }) : undefined;
  const offTimeActual =
    process.env.FLIGHT_REGISTRATION_DATASOURCE === 'flightstats'
      ? null
      : undefined;
  const inTime =
    flight.schedule.scheduledArrivalUTC !== null
      ? new Date(flight.schedule.scheduledArrivalUTC)
      : undefined;
  const inTimeActual =
    flight.schedule.estimatedActualArrivalUTC !== null
      ? new Date(flight.schedule.estimatedActualArrivalUTC)
      : null;
  const onTime =
    inTime !== undefined ? sub(inTime, { minutes: 10 }) : undefined;
  const onTimeActual =
    process.env.FLIGHT_REGISTRATION_DATASOURCE === 'flightstats'
      ? null
      : undefined;
  const duration =
    outTime !== undefined && inTime !== undefined
      ? getDurationMinutes({
          start: outTime,
          end: inTime,
        })
      : undefined;
  const tailNumber =
    process.env.FLIGHT_REGISTRATION_DATASOURCE === 'flightstats'
      ? flight.positional.flexTrack?.tailNumber
      : undefined;
  const airframe =
    process.env.FLIGHT_REGISTRATION_DATASOURCE === 'flightstats'
      ? tailNumber !== undefined && tailNumber !== null
        ? tailNumber !== prevTailNumber
          ? await getAirframe(tailNumber)
          : undefined
        : null
      : undefined;
  const aircraftType =
    process.env.FLIGHT_REGISTRATION_DATASOURCE === 'flightstats' &&
    (airframe?.aircraftTypeId === null ||
      airframe?.aircraftTypeId === undefined)
      ? await prisma.aircraftType.findFirst({
          where: {
            iata: flight.additionalFlightInfo.equipment.iata,
          },
        })
      : undefined;
  return {
    duration,
    outTime,
    outTimeActual,
    offTime,
    offTimeActual,
    onTime,
    onTimeActual,
    inTime,
    inTimeActual,
    departureGate: flight.departureAirport.gate ?? undefined,
    arrivalGate: flight.arrivalAirport.gate ?? undefined,
    departureTerminal: flight.departureAirport.terminal ?? undefined,
    arrivalTerminal: flight.arrivalAirport.terminal ?? undefined,
    arrivalBaggage: flight.arrivalAirport.baggage ?? undefined,
    airframeId: airframe !== undefined ? (airframe?.icao24 ?? null) : undefined,
    tailNumber,
    aircraftTypeId: airframe?.aircraftTypeId ?? aircraftType?.id ?? undefined,
    callsign: flight.positional.flexTrack?.callsign,
    tracklog: flight.positional.flexTrack?.positions
      ?.reverse()
      .map(({ date, lat, lon, altitudeFt, speedMph }) => ({
        timestamp: Math.round(getTime(parseISO(date)) / 1000),
        coord: [lon, lat],
        alt: altitudeFt / 100,
        gs: Math.round((10 * speedMph) / KTS_TO_MPH) / 10,
      })) as Prisma.JsonArray | undefined,
  };
};

export const updateFlightTimesData = async (
  flights: FlightWithData[],
): Promise<FlightWithData[]> => {
  if (flights[0].airline === null || flights[0].flightNumber === null) {
    console.log('Airline and flight number are required.');
    return flights;
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
  const flightDataString = getGroupedFlightsKey(flights[0]);
  if (process.env.FLIGHT_TIMES_DATASOURCE === 'flightaware') {
    console.log(`Fetching flight times data for ${flightDataString}...`);
    const flightAwareResponse = await fetchFlightAwareData({
      airline: flights[0].airline,
      arrivalIata: flights[0].arrivalAirport.iata,
      departureIata: flights[0].departureAirport.iata,
      flightNumber: flights[0].flightNumber,
      isoDate,
      fetchTrackingData: isWithinOneDay,
    });
    if (flightAwareResponse === null) {
      console.log(`  Flight times data not found for ${flightDataString}.`);
      return flights;
    }
    const updatedData = getFlightAwareUpdatedData(flightAwareResponse);
    const airframeId = flights[0].airframeId;
    const updatedFlights = await prisma.$transaction(
      flights.map(({ id }) =>
        prisma.flight.update({
          where: {
            id,
          },
          data: {
            ...updatedData,
            tracklog:
              process.env.FLIGHT_TRACKLOG_DATASOURCE === 'flightaware' ||
              airframeId === null
                ? updatedData.tracklog
                : undefined,
          },
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
    console.log(`Fetching flight times data for ${flightDataString}...`);
    const flightStatsResponse = await fetchFlightStatsData({
      airline: flights[0].airline,
      arrivalIata: flights[0].arrivalAirport.iata,
      departureIata: flights[0].departureAirport.iata,
      flightNumber: flights[0].flightNumber,
      isoDate,
    });
    if (flightStatsResponse === null) {
      console.log(`  Flight times data not found for ${flightDataString}.`);
      return flights;
    }
    const updatedData = await getFlightStatsUpdatedData(
      flightStatsResponse,
      flights[0].tailNumber,
    );
    const airframeId = updatedData.airframeId ?? flights[0].airframeId;
    const updatedFlights = await prisma.$transaction(
      flights.map(({ id }) =>
        prisma.flight.update({
          where: {
            id,
          },
          data: {
            ...updatedData,
            tracklog:
              process.env.FLIGHT_TRACKLOG_DATASOURCE === 'flightstats' ||
              airframeId === null
                ? updatedData.tracklog
                : undefined,
          },
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
  return flights;
};
