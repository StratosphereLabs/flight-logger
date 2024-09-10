import { formatInTimeZone } from 'date-fns-tz';
import { DATE_FORMAT_ISO } from '../constants';
import { fetchFlightRadarData } from '../data/flightRadar';
import { prisma } from '../db';
import type { FlightWithData } from './types';
import { updateFlightChangeData } from './updateFlightChangeData';
import { getGroupedFlightsKey } from './utils';

export const updateFlightRegistrationData = async (
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
  const flight = await fetchFlightRadarData({
    airline: flights[0].airline,
    flightNumber: flights[0].flightNumber,
    departureAirport: flights[0].departureAirport,
    arrivalAirport: flights[0].arrivalAirport,
    isoDate,
  });
  if (flight === null) {
    console.error(
      `  Unable to fetch registration data for ${getGroupedFlightsKey(
        flights[0],
      )}. Please try again later.`,
    );
    return;
  }
  const airframe =
    flight.registration !== undefined
      ? await prisma.airframe.findFirst({
          where: {
            registration: flight.registration,
          },
          cacheStrategy: {
            ttl: 24 * 60 * 60,
          },
        })
      : null;
  const aircraftType =
    flight.aircraftTypeCode.length >= 3 &&
    (airframe?.aircraftTypeId === null ||
      airframe?.aircraftTypeId === undefined)
      ? await prisma.aircraft_type.findFirst({
          where: {
            OR: [
              {
                icao: flight.aircraftTypeCode,
              },
              {
                iata: flight.aircraftTypeCode,
              },
            ],
          },
          cacheStrategy: {
            ttl: 30 * 24 * 60 * 60,
          },
        })
      : undefined;
  const diversionAirport =
    flight.diversionIata !== null
      ? await prisma.airport.findFirst({
          where: {
            iata: flight.diversionIata,
          },
          cacheStrategy: {
            ttl: 30 * 24 * 60 * 60,
          },
        })
      : null;
  const updatedData = {
    airframeId: airframe !== undefined ? airframe?.icao24 ?? null : undefined,
    tailNumber: flight.registration,
    offTimeActual: flight.offTimeActual,
    onTimeActual: flight.onTimeActual,
    aircraftTypeId: airframe?.aircraftTypeId ?? aircraftType?.id ?? undefined,
    flightRadarStatus: flight.flightStatus,
    diversionAirportId: diversionAirport?.id ?? undefined,
  };
  await prisma.flight.updateMany({
    where: {
      id: {
        in: flights.map(({ id }) => id),
      },
    },
    data: updatedData,
  });
  await updateFlightChangeData(flights, updatedData);
};
