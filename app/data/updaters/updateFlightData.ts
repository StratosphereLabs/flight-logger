import { type WithRequired } from '@tanstack/react-query';

import { prisma } from '../../db';
import { FLIGHTAWARE_DATA_INCLUDE_KEYS } from '../constants';
import {
  type FlightAwareFlightUpdateData,
  getFlightAwareFlightUpdate,
} from '../flightAware';
import {
  type FlightRadarFlightUpdateData,
  getFlightRadarFlightUpdate,
} from '../flightRadar';
import {
  type FlightStatsFlightUpdateData,
  getFlightStatsFlightUpdate,
} from '../flightStats';
import type { FlightWithData } from '../types';
import { getGroupedFlightsKey, removeNullish } from '../utils';
import { updateFlightChangeData } from './updateFlightChangeData';
import { updateFlightTrackData } from './updateFlightTrackData';

export const updateFlightData = async (
  flights: FlightWithData[],
): Promise<FlightWithData[]> => {
  const firstFlight = flights[0] as WithRequired<
    FlightWithData,
    'flightNumber' | 'airline'
  >;
  if (
    firstFlight.airline === null ||
    firstFlight.airline === undefined ||
    firstFlight.flightNumber === null
  ) {
    return flights;
  }
  const flightDataString = getGroupedFlightsKey(flights[0]);
  console.log(`Fetching flight data for ${flightDataString}...`);
  let flightStatsUpdate: FlightStatsFlightUpdateData | null = null;
  let flightRadarUpdate: FlightRadarFlightUpdateData | null = null;
  let flightAwareUpdate: FlightAwareFlightUpdateData | null = null;
  if (process.env.DATASOURCE_FLIGHTSTATS === 'true') {
    try {
      flightStatsUpdate = await getFlightStatsFlightUpdate(firstFlight);
    } catch (err) {
      console.error(err);
    }
  }
  if (process.env.DATASOURCE_FLIGHTRADAR === 'true') {
    try {
      flightRadarUpdate = await getFlightRadarFlightUpdate(firstFlight);
    } catch (err) {
      console.error(err);
    }
  }
  const combinedUpdate: Partial<
    FlightStatsFlightUpdateData & FlightRadarFlightUpdateData
  > = {
    ...removeNullish(flightRadarUpdate ?? {}),
    ...removeNullish(flightStatsUpdate ?? {}),
  };
  if (
    process.env.DATASOURCE_FLIGHTAWARE === 'true' &&
    !FLIGHTAWARE_DATA_INCLUDE_KEYS.every(key => combinedUpdate[key])
  ) {
    try {
      flightAwareUpdate = await getFlightAwareFlightUpdate(firstFlight);
    } catch (err) {
      console.error(err);
    }
  }
  const flightUpdateData = {
    ...removeNullish(flightAwareUpdate ?? {}),
    ...combinedUpdate,
  };
  if (Object.keys(flightUpdateData).length === 0) {
    console.log(`  No flight data found for ${flightDataString}.`);
    return flights;
  }
  const updatedFlights = await prisma.$transaction(
    flights.map(({ id }) =>
      prisma.flight.update({
        where: {
          id,
        },
        data: flightUpdateData,
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
  await updateFlightChangeData(flights, flightUpdateData);
  await updateFlightTrackData(updatedFlights);
  return updatedFlights;
};
