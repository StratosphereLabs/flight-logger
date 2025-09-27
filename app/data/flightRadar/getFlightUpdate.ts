import { type WithRequired } from '@tanstack/react-query';
import { add, sub } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

import { DATE_FORMAT_ISO } from '../../constants';
import { prisma } from '../../db';
import { getAirframe, getDurationMinutes } from '../../utils';
import type { FlightWithData } from '../types';
import { fetchFlightRadarFlightData } from './fetchFlightData';

export type FlightRadarFlightUpdateData = Awaited<
  ReturnType<typeof getFlightRadarFlightUpdate>
>;

export const getFlightRadarFlightUpdate = async (
  flight: WithRequired<FlightWithData, 'airline' | 'flightNumber'>,
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
) => {
  const isoDate = formatInTimeZone(
    flight.outTime,
    flight.departureAirport.timeZone,
    DATE_FORMAT_ISO,
  );
  const flightData = await fetchFlightRadarFlightData({
    airline: flight.airline,
    flightNumber: flight.flightNumber,
    departureAirport: flight.departureAirport,
    arrivalAirport: flight.arrivalAirport,
    isoDate,
  });
  if (flightData === null) {
    return null;
  }
  const airframe =
    flightData.registration !== undefined && flightData.registration !== null
      ? flightData.registration !== flight.tailNumber
        ? await getAirframe(flightData.registration)
        : null
      : null;
  const aircraftType =
    flightData.aircraftTypeCode.length >= 3 &&
    (airframe?.aircraftTypeId === null ||
      airframe?.aircraftTypeId === undefined)
      ? await prisma.aircraftType.findFirst({
          where: {
            OR: [
              {
                icao: flightData.aircraftTypeCode,
              },
              {
                iata: flightData.aircraftTypeCode,
              },
            ],
          },
        })
      : null;
  const diversionAirport =
    flightData.diversionIata !== null
      ? await prisma.airport.findFirst({
          where: {
            iata: flightData.diversionIata,
          },
        })
      : null;
  return {
    diversionAirportId: diversionAirport?.id ?? null,
    aircraftTypeId: airframe?.aircraftTypeId ?? aircraftType?.id ?? null,
    airframeId: airframe?.icao24 ?? null,
    tailNumber: flightData.registration,
    outTime: flightData.outTime,
    offTime: add(flightData.outTime, { minutes: 10 }),
    onTime: sub(flightData.inTime, { minutes: 10 }),
    inTime: flightData.inTime,
    duration: getDurationMinutes({
      start: flightData.outTime,
      end: flightData.inTime,
    }),
    offTimeActual: flightData.offTimeActual,
    onTimeActual: flightData.onTimeActual,
  };
};
