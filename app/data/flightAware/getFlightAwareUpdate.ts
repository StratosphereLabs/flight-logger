import { type Prisma } from '@prisma/client';
import { type WithRequired } from '@tanstack/react-query';
import { add, isAfter } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

import type { FlightWithData } from '../../commands/types';
import { getGroupedFlightsKey } from '../../commands/utils';
import { DATE_FORMAT_ISO } from '../../constants';
import { prisma } from '../../db';
import { getDurationMinutes } from '../../utils';
import { createNewDate } from '../utils';
import { fetchFlightAwareData } from './fetchFlightAwareData';

export const getFlightAwareUpdate = async (
  flight: WithRequired<FlightWithData, 'airline' | 'flightNumber'>,
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
) => {
  const flightDataString = getGroupedFlightsKey(flight);
  console.log(`Fetching FlightAware data for ${flightDataString}...`);
  const isoDate = formatInTimeZone(
    flight.outTime,
    flight.departureAirport.timeZone,
    DATE_FORMAT_ISO,
  );
  const isWithinOneDay = isAfter(add(new Date(), { days: 1 }), flight.outTime);
  const flightAwareResponse = await fetchFlightAwareData({
    airline: flight.airline,
    arrivalIata: flight.arrivalAirport.iata,
    departureIata: flight.departureAirport.iata,
    flightNumber: flight.flightNumber,
    isoDate,
    fetchTrackingData: isWithinOneDay,
  });
  if (flightAwareResponse === null) {
    console.log(`  FlightAware data not found for ${flightDataString}.`);
    return null;
  }
  const aircraftType =
    flightAwareResponse.aircraftType !== null
      ? await prisma.aircraftType.findFirst({
          where: {
            icao: flightAwareResponse.aircraftType,
          },
          select: {
            id: true,
          },
        })
      : null;
  const outTime = createNewDate(
    flightAwareResponse.gateDepartureTimes.scheduled,
  );
  const offTime = createNewDate(flightAwareResponse.takeoffTimes.scheduled);
  const onTime = createNewDate(flightAwareResponse.landingTimes.scheduled);
  const inTime = createNewDate(flightAwareResponse.gateArrivalTimes.scheduled);
  const duration = getDurationMinutes({
    start: outTime,
    end: inTime,
  });
  const outTimeActual =
    flightAwareResponse.gateDepartureTimes.actual !== null
      ? createNewDate(flightAwareResponse.gateDepartureTimes.actual)
      : flightAwareResponse.gateDepartureTimes.estimated !== null
        ? createNewDate(flightAwareResponse.gateDepartureTimes.estimated)
        : null;
  const inTimeActual =
    flightAwareResponse.gateArrivalTimes.actual !== null
      ? createNewDate(flightAwareResponse.gateArrivalTimes.actual)
      : flightAwareResponse.gateArrivalTimes.estimated !== null
        ? createNewDate(flightAwareResponse.gateArrivalTimes.estimated)
        : null;
  return {
    aircraftTypeId: aircraftType !== null ? aircraftType.id : null,
    outTime,
    offTime,
    onTime,
    inTime,
    duration,
    outTimeActual,
    inTimeActual,
    departureGate: flightAwareResponse.origin.gate,
    departureTerminal: flightAwareResponse.origin.terminal,
    arrivalGate: flightAwareResponse.destination.gate,
    arrivalTerminal: flightAwareResponse.destination.terminal,
    tracklog: (flightAwareResponse.track ?? null) as Prisma.JsonArray | null,
    waypoints: (flightAwareResponse.waypoints ??
      null) as Prisma.JsonArray | null,
    flightAwareLink: flightAwareResponse.permaLink,
  };
};
