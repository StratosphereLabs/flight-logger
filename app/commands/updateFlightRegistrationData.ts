import { formatInTimeZone } from 'date-fns-tz';
import { DATE_FORMAT_ISO } from '../constants';
import { fetchFlightRegistrationData } from '../data/flightRadar';
import { prisma } from '../db';
import type { FlightWithData } from './types';
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
  const flight = await fetchFlightRegistrationData({
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
        })
      : null;
  await prisma.flight.updateMany({
    where: {
      id: {
        in: flights.map(({ id }) => id),
      },
    },
    data: {
      airframeId: airframe !== null ? airframe.icao24 : undefined,
      tailNumber: flight.registration,
      offTimeActual: flight.offTimeActual,
      onTimeActual: flight.onTimeActual,
      aircraftTypeId: airframe?.aircraftTypeId ?? aircraftType?.id ?? undefined,
    },
  });
};
