import { formatInTimeZone } from 'date-fns-tz';
import { DATE_FORMAT_ISO } from '../constants';
import { fetchFlightStatsData } from '../data/flightStats';
import { prisma, updateTripTimes } from '../db';
import { getDurationMinutes } from '../utils';
import { type FlightWithData } from './updateData';
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
  const flight = await fetchFlightStatsData({
    airlineIata: flights[0].airline.iata,
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
      departureGate: flight.departureAirport.gate ?? undefined,
      arrivalGate: flight.arrivalAirport.gate ?? undefined,
      departureTerminal: flight.departureAirport.terminal ?? undefined,
      arrivalTerminal: flight.arrivalAirport.terminal ?? undefined,
      arrivalBaggage: flight.arrivalAirport.baggage ?? undefined,
    },
  });
  await Promise.all(
    flights.flatMap(({ tripId }) =>
      tripId !== null ? updateTripTimes(tripId) : [],
    ),
  );
};
