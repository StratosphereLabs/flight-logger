import { formatInTimeZone } from 'date-fns-tz';
import { DATE_FORMAT_ISO } from '../constants';
import { fetchFlightAwareData } from '../data/flightAware';
import { createNewDate } from '../data/utils';
import { prisma, updateTripTimes } from '../db';
import { getDurationMinutes } from '../utils';
import type { FlightWithData } from './types';
import { getGroupedFlightsKey } from './utils';

export const updateFlightTimesData = async (
  flights: FlightWithData[],
): Promise<void> => {
  if (flights[0].airline === null || flights[0].flightNumber === null) {
    console.error('Airline and flight number are required.');
    return;
  }
  const isoDate = formatInTimeZone(
    flights[0].outTime,
    flights[0].departureAirport.timeZone,
    DATE_FORMAT_ISO,
  );
  const flight = await fetchFlightAwareData({
    airline: flights[0].airline,
    arrivalIata: flights[0].arrivalAirport.iata,
    departureIata: flights[0].departureAirport.iata,
    flightNumber: flights[0].flightNumber,
    isoDate,
  });
  if (flight === null) {
    console.error(
      `  Flight times data not found for ${getGroupedFlightsKey(
        flights[0],
      )}. Please try again later.`,
    );
    return;
  }
  const outTime = createNewDate(flight.gateDepartureTimes.scheduled);
  const outTimeActual =
    flight.gateDepartureTimes.actual !== null
      ? createNewDate(flight.gateDepartureTimes.actual)
      : flight.gateDepartureTimes.scheduled !== null
        ? createNewDate(flight.gateDepartureTimes.scheduled)
        : null;
  const inTime = createNewDate(flight.gateArrivalTimes.scheduled);
  const inTimeActual =
    flight.gateArrivalTimes.actual !== null
      ? createNewDate(flight.gateArrivalTimes.actual)
      : flight.gateArrivalTimes.scheduled !== null
        ? createNewDate(flight.gateArrivalTimes.scheduled)
        : null;
  await prisma.flight.updateMany({
    where: {
      id: {
        in: flights.map(({ id }) => id),
      },
    },
    data: {
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
    },
  });
  await Promise.all(
    flights.flatMap(({ tripId }) =>
      tripId !== null ? updateTripTimes(tripId) : [],
    ),
  );
};
