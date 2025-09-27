import { type Prisma } from '@prisma/client';
import { type WithRequired } from '@tanstack/react-query';
import { add, isAfter } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

import { DATE_FORMAT_ISO } from '../../constants';
import { prisma } from '../../db';
import { getDurationMinutes } from '../../utils';
import type { FlightWithData } from '../types';
import { createNewDate, getGroupedFlightsKey } from '../utils';
import { fetchFlightAwareFlightData } from './fetchFlightData';

export type FlightAwareFlightUpdateData = Awaited<
  ReturnType<typeof getFlightAwareFlightUpdate>
>;

export const getFlightAwareFlightUpdate = async (
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
  const flightData = await fetchFlightAwareFlightData({
    airline: flight.airline,
    arrivalAirport: flight.arrivalAirport,
    departureAirport: flight.departureAirport,
    flightNumber: flight.flightNumber,
    isoDate,
    fetchTrackingData: isWithinOneDay,
  });
  if (flightData === null) {
    console.log(`  FlightAware data not found for ${flightDataString}.`);
    return null;
  }
  const aircraftType =
    flightData.aircraftType !== null
      ? await prisma.aircraftType.findFirst({
          where: {
            icao: flightData.aircraftType,
          },
          select: {
            id: true,
          },
        })
      : null;
  const outTime = createNewDate(flightData.gateDepartureTimes.scheduled);
  const offTime = createNewDate(flightData.takeoffTimes.scheduled);
  const onTime = createNewDate(flightData.landingTimes.scheduled);
  const inTime = createNewDate(flightData.gateArrivalTimes.scheduled);
  const duration = getDurationMinutes({
    start: outTime,
    end: inTime,
  });
  const outTimeActual =
    flightData.gateDepartureTimes.actual !== null
      ? createNewDate(flightData.gateDepartureTimes.actual)
      : flightData.gateDepartureTimes.estimated !== null
        ? createNewDate(flightData.gateDepartureTimes.estimated)
        : null;
  const inTimeActual =
    flightData.gateArrivalTimes.actual !== null
      ? createNewDate(flightData.gateArrivalTimes.actual)
      : flightData.gateArrivalTimes.estimated !== null
        ? createNewDate(flightData.gateArrivalTimes.estimated)
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
    departureGate: flightData.origin.gate,
    departureTerminal: flightData.origin.terminal,
    arrivalGate: flightData.destination.gate,
    arrivalTerminal: flightData.destination.terminal,
    tracklog: flightData.track as Prisma.JsonArray | undefined,
    waypoints: flightData.waypoints as Prisma.JsonArray | undefined,
    flightAwareLink: flightData.permaLink,
  };
};
