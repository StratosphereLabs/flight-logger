import { formatInTimeZone } from 'date-fns-tz';

import { DATE_FORMAT_ISO } from '../constants';
import { fetchFlightRadarData } from '../data/flightRadar';
import { prisma } from '../db';
import type { FlightWithData } from './types';
import { updateFlightChangeData } from './updateFlightChangeData';
import { getGroupedFlightsKey } from './utils';

export const updateFlightRegistrationData = async (
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
  if (process.env.FLIGHT_TRACKING_DATASOURCE === 'flightradar') {
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
      return null;
    }
    const airframe =
      flight.registration !== undefined && flight.registration !== null
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
        ? await prisma.aircraftType.findFirst({
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
        : undefined;
    const diversionAirport =
      flight.diversionIata !== null
        ? await prisma.airport.findFirst({
            where: {
              iata: flight.diversionIata,
            },
          })
        : null;
    const updatedData = {
      airframeId:
        airframe !== undefined ? (airframe?.icao24 ?? null) : undefined,
      tailNumber: flight.registration,
      offTimeActual: flight.offTimeActual,
      onTimeActual: flight.onTimeActual,
      aircraftTypeId: airframe?.aircraftTypeId ?? aircraftType?.id ?? undefined,
      diversionAirportId: diversionAirport?.id ?? null,
    };
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
    return updatedFlights;
  }
  return null;
};
