import { type WithRequired } from '@tanstack/react-query';
import { add, sub } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

import type { FlightWithData } from '../../commands/types';
import { getGroupedFlightsKey } from '../../commands/utils';
import { DATE_FORMAT_ISO } from '../../constants';
import { prisma } from '../../db';
import { getAirframe, getDurationMinutes } from '../../utils';
import type { FlightUpdateInput } from '../types';
import { fetchFlightRadarData } from './fetchFlightRadarData';

export const getFlightRadarUpdate = async (
  flight: WithRequired<FlightWithData, 'airline' | 'flightNumber'>,
): Promise<FlightUpdateInput | null> => {
  const flightDataString = getGroupedFlightsKey(flight);
  console.log(`Fetching FlightRadar24 data for ${flightDataString}...`);
  const isoDate = formatInTimeZone(
    flight.outTime,
    flight.departureAirport.timeZone,
    DATE_FORMAT_ISO,
  );
  const flightRadarData = await fetchFlightRadarData({
    airline: flight.airline,
    flightNumber: flight.flightNumber,
    departureAirport: flight.departureAirport,
    arrivalAirport: flight.arrivalAirport,
    isoDate,
  });
  if (flightRadarData === null) {
    console.log(`  FlightRadar24 data not found for ${flightDataString}.`);
    return null;
  }
  const airframe =
    flightRadarData.registration !== undefined &&
    flightRadarData.registration !== null
      ? flightRadarData.registration !== flight.tailNumber
        ? await getAirframe(flightRadarData.registration)
        : null
      : null;
  const aircraftType =
    flightRadarData.aircraftTypeCode.length >= 3 &&
    (airframe?.aircraftTypeId === null ||
      airframe?.aircraftTypeId === undefined)
      ? await prisma.aircraftType.findFirst({
          where: {
            OR: [
              {
                icao: flightRadarData.aircraftTypeCode,
              },
              {
                iata: flightRadarData.aircraftTypeCode,
              },
            ],
          },
        })
      : null;
  const diversionAirport =
    flightRadarData.diversionIata !== null
      ? await prisma.airport.findFirst({
          where: {
            iata: flightRadarData.diversionIata,
          },
        })
      : null;
  return {
    diversionAirportId: diversionAirport?.id ?? null,
    aircraftTypeId: airframe?.aircraftTypeId ?? aircraftType?.id ?? null,
    airframeId: airframe?.icao24 ?? null,
    tailNumber: flightRadarData.registration,
    outTime: flightRadarData.outTime,
    offTime: add(flightRadarData.outTime, { minutes: 10 }),
    onTime: sub(flightRadarData.inTime, { minutes: 10 }),
    inTime: flightRadarData.inTime,
    duration: getDurationMinutes({
      start: flightRadarData.outTime,
      end: flightRadarData.inTime,
    }),
    offTimeActual: flightRadarData.offTimeActual,
    onTimeActual: flightRadarData.onTimeActual,
  };
};
