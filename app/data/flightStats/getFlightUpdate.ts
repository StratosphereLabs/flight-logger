import { type WithRequired } from '@tanstack/react-query';
import { add, sub } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

import { DATE_FORMAT_ISO } from '../../constants';
import { prisma } from '../../db';
import { getAirframe, getDurationMinutes } from '../../utils';
import type { FlightWithData } from '../types';
import { fetchFlightStatsFlightData } from './fetchFlightData';

export type FlightStatsFlightUpdateData = Awaited<
  ReturnType<typeof getFlightStatsFlightUpdate>
>;

export const getFlightStatsFlightUpdate = async (
  flight: WithRequired<FlightWithData, 'airline' | 'flightNumber'>,
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
) => {
  const isoDate = formatInTimeZone(
    flight.outTime,
    flight.departureAirport.timeZone,
    DATE_FORMAT_ISO,
  );
  const flightStatsResponse = await fetchFlightStatsFlightData({
    airline: flight.airline,
    arrivalAirport: flight.arrivalAirport,
    departureAirport: flight.departureAirport,
    flightNumber: flight.flightNumber,
    isoDate,
  });
  if (flightStatsResponse === null) {
    return null;
  }
  const diversionAirport =
    flightStatsResponse.divertedAirport !== null
      ? await prisma.airport.findFirst({
          where: {
            iata: flightStatsResponse.divertedAirport.iata,
          },
          select: {
            id: true,
          },
        })
      : null;
  const tailNumber =
    flightStatsResponse.positional.flexTrack?.tailNumber ?? null;
  const airframe = tailNumber !== null ? await getAirframe(tailNumber) : null;
  const aircraftType =
    flightStatsResponse.additionalFlightInfo.equipment !== null &&
    (airframe?.aircraftTypeId === null ||
      airframe?.aircraftTypeId === undefined)
      ? await prisma.aircraftType.findFirst({
          where: {
            iata: flightStatsResponse.additionalFlightInfo.equipment.iata,
          },
          select: {
            id: true,
          },
        })
      : null;
  const outTime =
    flightStatsResponse.schedule.scheduledDepartureUTC !== null
      ? new Date(flightStatsResponse.schedule.scheduledDepartureUTC)
      : undefined;
  const outTimeActual =
    flightStatsResponse.schedule.estimatedActualDepartureUTC !== null
      ? new Date(flightStatsResponse.schedule.estimatedActualDepartureUTC)
      : null;
  const offTime = outTime !== undefined ? add(outTime, { minutes: 10 }) : null;
  const inTime =
    flightStatsResponse.schedule.scheduledArrivalUTC !== null
      ? new Date(flightStatsResponse.schedule.scheduledArrivalUTC)
      : undefined;
  const inTimeActual =
    flightStatsResponse.schedule.estimatedActualArrivalUTC !== null
      ? new Date(flightStatsResponse.schedule.estimatedActualArrivalUTC)
      : null;
  const onTime = inTime !== undefined ? sub(inTime, { minutes: 10 }) : null;
  const duration =
    outTime !== undefined && inTime !== undefined
      ? getDurationMinutes({
          start: outTime,
          end: inTime,
        })
      : undefined;
  return {
    diversionAirportId: diversionAirport !== null ? diversionAirport.id : null,
    aircraftTypeId: airframe?.aircraftTypeId ?? aircraftType?.id ?? null,
    airframeId: airframe?.icao24 ?? null,
    tailNumber,
    callsign: flightStatsResponse.positional.flexTrack?.callsign ?? null,
    outTime,
    offTime,
    onTime,
    inTime,
    duration,
    outTimeActual,
    inTimeActual,
    departureGate: flightStatsResponse.departureAirport.gate,
    departureTerminal: flightStatsResponse.departureAirport.terminal,
    arrivalGate: flightStatsResponse.arrivalAirport.gate,
    arrivalTerminal: flightStatsResponse.arrivalAirport.terminal,
    arrivalBaggage: flightStatsResponse.arrivalAirport.baggage,
  };
};
