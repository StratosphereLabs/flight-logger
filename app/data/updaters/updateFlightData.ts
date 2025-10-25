import { type WithRequired } from '@tanstack/react-query';

import { prisma } from '../../db';
import { calculateDistance } from '../../utils';
import {
  FLIGHTAWARE_DATA_INCLUDE_KEYS,
  FLIGHTRADAR_DATA_INCLUDE_KEYS,
} from '../constants';
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
import { getGroupedFlightsKey, removeUndefined } from '../utils';
import {
  type FlightTrackUpdateData,
  getFlightTrackDataUpdate,
} from './getFlightTrackDataUpdate';
import { updateFlightChangeData } from './updateFlightChangeData';

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
  if (process.env.DATASOURCE_FLIGHTSTATS === 'true') {
    try {
      flightStatsUpdate = await getFlightStatsFlightUpdate(firstFlight);
    } catch (err) {
      console.error(err);
    }
  }
  const flightTrackDataUpdate = await getFlightTrackDataUpdate(
    flights,
    flightStatsUpdate,
  );
  const combinedUpdate: Partial<
    FlightStatsFlightUpdateData & FlightTrackUpdateData
  > = {
    ...removeUndefined(flightStatsUpdate ?? {}),
    ...removeUndefined(flightTrackDataUpdate ?? {}),
  };
  const flightDistance = calculateDistance(
    flights[0].departureAirport.lat,
    flights[0].departureAirport.lon,
    flights[0].arrivalAirport.lat,
    flights[0].arrivalAirport.lon,
  );
  const latestTracklogItem =
    flightTrackDataUpdate !== null && flightTrackDataUpdate.tracklog.length > 0
      ? flightTrackDataUpdate.tracklog[
          flightTrackDataUpdate.tracklog.length - 1
        ]
      : null;
  const isTracklogDataInvalid =
    latestTracklogItem !== null
      ? calculateDistance(
          flights[0].departureAirport.lat,
          flights[0].departureAirport.lon,
          latestTracklogItem.coord[1],
          latestTracklogItem.coord[0],
        ) >
          flightDistance * 1.5 ||
        calculateDistance(
          flights[0].arrivalAirport.lat,
          flights[0].arrivalAirport.lon,
          latestTracklogItem.coord[1],
          latestTracklogItem.coord[0],
        ) >
          flightDistance * 1.5
      : false;
  let flightRadarUpdate: FlightRadarFlightUpdateData | null = null;
  if (
    process.env.DATASOURCE_FLIGHTRADAR === 'true' &&
    (isTracklogDataInvalid ||
      FLIGHTRADAR_DATA_INCLUDE_KEYS.some(
        key => combinedUpdate[key] === undefined,
      ))
  ) {
    try {
      flightRadarUpdate = await getFlightRadarFlightUpdate(firstFlight);
    } catch (err) {
      console.error(err);
    }
  }
  const combinedUpdateWithFlightRadar: Partial<
    FlightStatsFlightUpdateData & FlightRadarFlightUpdateData
  > = {
    ...combinedUpdate,
    ...removeUndefined(flightRadarUpdate ?? {}),
  };
  let flightAwareUpdate: FlightAwareFlightUpdateData | null = null;
  if (
    process.env.DATASOURCE_FLIGHTAWARE === 'true' &&
    FLIGHTAWARE_DATA_INCLUDE_KEYS.some(
      key => combinedUpdateWithFlightRadar[key] === undefined,
    )
  ) {
    try {
      flightAwareUpdate = await getFlightAwareFlightUpdate(firstFlight);
    } catch (err) {
      console.error(err);
    }
  }
  const flightUpdateData = {
    ...combinedUpdateWithFlightRadar,
    ...removeUndefined(flightAwareUpdate ?? {}),
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
              lat: true,
              lon: true,
              elevation: true,
            },
          },
          arrivalAirport: {
            select: {
              id: true,
              iata: true,
              timeZone: true,
              lat: true,
              lon: true,
              elevation: true,
            },
          },
          diversionAirport: {
            select: {
              id: true,
              iata: true,
              timeZone: true,
              lat: true,
              lon: true,
              elevation: true,
            },
          },
        },
      }),
    ),
  );
  await updateFlightChangeData(flights, flightUpdateData);
  return updatedFlights;
};
