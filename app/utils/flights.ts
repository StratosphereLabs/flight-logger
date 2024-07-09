import type {
  FlightRadarStatus,
  aircraft_type,
  airframe,
  airline,
  airport,
  flight,
  region,
  user,
} from '@prisma/client';
import {
  add,
  endOfMonth,
  endOfYear,
  isAfter,
  isBefore,
  min,
  startOfMonth,
  startOfYear,
  sub,
} from 'date-fns';
import groupBy from 'lodash.groupby';
import { type GetProfileFiltersRequest } from '../schemas';
import { type LatLng } from '../types';
import { calculateCenterPoint, type Coordinates } from './coordinates';
import { getDurationMinutes, getDurationString, getInFuture } from './datetime';
import { calculateDistance, getBearing, getProjectedCoords } from './distance';
import {
  type FlightTimestampsResult,
  getFlightTimestamps,
  type FlightDelayStatus,
} from './flighttime';
import { excludeKeys } from './server';
import { fetchGravatarUrl } from './users';

export const flightIncludeObj = {
  user: true,
  departureAirport: {
    include: {
      region: true,
    },
  },
  arrivalAirport: {
    include: {
      region: true,
    },
  },
  airline: true,
  aircraftType: true,
  airframe: {
    include: {
      aircraftType: true,
      operator: true,
    },
  },
};

export interface AirframeData extends airframe {
  aircraftType: aircraft_type | null;
  operator: airline | null;
}

export interface AirportData extends airport {
  region: region;
}

export interface FlightData extends flight {
  user: user;
  departureAirport: AirportData;
  arrivalAirport: AirportData;
  airline: airline | null;
  aircraftType: aircraft_type | null;
  airframe: AirframeData | null;
}

export interface Route {
  departureAirport: airport;
  arrivalAirport: airport;
}

export type FlightWithAirports = flight & Route;

export type FlightDataWithTimestamps = FlightData & FlightTimestampsResult;

export interface RouteResult {
  airports: [airport, airport];
  frequency: number;
  isCompleted: boolean;
  inFuture: boolean;
}

export interface HeatmapResult extends LatLng {
  inFuture: boolean;
}

export interface FlightsResult extends Array<FlightWithAirports> {}

export interface TransformFlightDataResult
  extends Omit<FlightData, 'user'>,
    FlightTimestampsResult {
  user: {
    avatar: string;
  } & Omit<
    user,
    | 'admin'
    | 'password'
    | 'id'
    | 'pushNotifications'
    | 'passwordResetToken'
    | 'passwordResetAt'
  >;
  distance: number;
  flightNumberString: string;
  link: string;
  minutesToDeparture: number;
  minutesToTakeoff: number;
  minutesToArrival: number;
  minutesToLanding: number;
  durationToDepartureString: string;
  durationToDepartureAbbrString: string;
  durationToArrivalString: string;
  durationToArrivalAbbrString: string;
  durationToTakeoffString: string;
  durationToLandingString: string;
  progress: number;
  flightProgress: number;
  flightStatus: string;
  delay: string | null;
  delayValue: number | null;
  delayStatus: FlightDelayStatus;
  estimatedLocation: Coordinates;
  estimatedHeading: number;
}

const FLIGHT_STATUS_MAP: Record<FlightRadarStatus, string> = {
  SCHEDULED: 'Scheduled',
  DEPARTED_TAXIING: 'Departed - Taxiing',
  EN_ROUTE: 'En Route',
  LANDED_TAXIING: 'Landed - Taxiing',
  ARRIVED: 'Arrived',
  CANCELED: '',
};

export const getCenterpoint = (
  result?: FlightsResult,
): Coordinates | undefined => {
  const airportMap: Record<string, airport> = {};
  if (result !== undefined) {
    if (result.length === 0) return undefined;
    for (const { departureAirport, arrivalAirport } of result) {
      airportMap[departureAirport.id] = departureAirport;
      airportMap[arrivalAirport.id] = arrivalAirport;
    }
  }
  const airports = Object.values(airportMap);
  return airports.length > 0
    ? calculateCenterPoint(airports.map(({ lat, lon }) => ({ lat, lng: lon })))
    : { lat: 0, lng: 0 };
};

export const getHeatmap = (result?: FlightsResult): HeatmapResult[] =>
  result?.flatMap(flight => [
    {
      inFuture: getInFuture(flight.outTime),
      lat: flight.departureAirport.lat,
      lng: flight.departureAirport.lon,
    },
    {
      inFuture: getInFuture(flight.inTime),
      lat: flight.arrivalAirport.lat,
      lng: flight.arrivalAirport.lon,
    },
  ]) ?? [];

export const getRoutes = (result?: FlightsResult): RouteResult[] => {
  const groupedFlights = groupBy(
    result,
    ({ departureAirport, arrivalAirport }) =>
      [departureAirport.id, arrivalAirport.id].sort().join('-'),
  );
  return Object.values(groupedFlights).map(flights => ({
    airports: [flights[0].departureAirport, flights[0].arrivalAirport],
    frequency: flights.length,
    isCompleted: flights.some(({ outTime }) => !getInFuture(outTime)),
    inFuture: flights.some(({ outTime }) => getInFuture(outTime)),
  }));
};

export const transformFlightData = (
  flight: FlightData,
): TransformFlightDataResult => {
  const timestamps = getFlightTimestamps({
    flightRadarStatus: flight.flightRadarStatus,
    departureTimeZone: flight.departureAirport.timeZone,
    arrivalTimeZone: flight.arrivalAirport.timeZone,
    duration: flight.duration,
    outTime: flight.outTime,
    outTimeActual: flight.outTimeActual ?? undefined,
    inTime: flight.inTime,
    inTimeActual: flight.inTimeActual ?? undefined,
  });
  const flightDistance = calculateDistance(
    flight.departureAirport.lat,
    flight.departureAirport.lon,
    flight.arrivalAirport.lat,
    flight.arrivalAirport.lon,
  );
  const departureTime = flight.outTimeActual ?? flight.outTime;
  const arrivalTime = flight.inTimeActual ?? flight.inTime;
  const runwayDepartureTime =
    flight.offTimeActual ?? add(departureTime, { minutes: 10 });
  const runwayArrivalTime =
    flight.onTimeActual ?? sub(arrivalTime, { minutes: 10 });
  const hasDeparted =
    flight.flightRadarStatus !== 'CANCELED' && !getInFuture(departureTime);
  const hasTakenOff =
    flight.flightRadarStatus !== 'CANCELED' &&
    !getInFuture(runwayDepartureTime);
  const hasLanded =
    flight.flightRadarStatus !== 'CANCELED' && !getInFuture(runwayArrivalTime);
  const hasArrived =
    flight.flightRadarStatus !== 'CANCELED' && !getInFuture(arrivalTime);
  const totalDuration = getDurationMinutes({
    start: departureTime,
    end: arrivalTime,
  });
  const flightDuration = getDurationMinutes({
    start: runwayDepartureTime,
    end: runwayArrivalTime,
  });
  const minutesToDeparture = getDurationMinutes({
    start: departureTime,
    end: new Date(),
  });
  const minutesToTakeoff = getDurationMinutes({
    start: runwayDepartureTime,
    end: new Date(),
  });
  const minutesToArrival = getDurationMinutes({
    start: new Date(),
    end: arrivalTime,
  });
  const minutesToLanding = getDurationMinutes({
    start: new Date(),
    end: runwayArrivalTime,
  });
  const currentDuration = hasDeparted
    ? !hasArrived
      ? minutesToDeparture
      : totalDuration
    : 0;
  const currentFlightDuration = hasTakenOff
    ? !hasLanded
      ? minutesToTakeoff
      : flightDuration
    : 0;
  const progress = currentDuration / totalDuration;
  const flightProgress = currentFlightDuration / flightDuration;
  const estimatedStatus =
    progress === 0
      ? 'SCHEDULED'
      : flightProgress === 0
        ? 'DEPARTED_TAXIING'
        : flightProgress < 1
          ? 'EN_ROUTE'
          : progress < 1
            ? 'LANDED_TAXIING'
            : 'ARRIVED';
  const flightStatus =
    FLIGHT_STATUS_MAP[flight.flightRadarStatus ?? estimatedStatus];
  const distanceTraveled = flightProgress * flightDistance;
  const initialHeading = getBearing(
    flight.departureAirport.lat,
    flight.departureAirport.lon,
    flight.arrivalAirport.lat,
    flight.arrivalAirport.lon,
  );
  const estimatedLocation = getProjectedCoords(
    flight.departureAirport.lat,
    flight.departureAirport.lon,
    distanceTraveled,
    initialHeading,
  );
  const estimatedHeading = getBearing(
    estimatedLocation.lat,
    estimatedLocation.lng,
    flight.arrivalAirport.lat,
    flight.arrivalAirport.lon,
  );
  const delayStatus =
    flight.flightRadarStatus === 'CANCELED'
      ? 'canceled'
      : progress > 0
        ? timestamps.arrivalDelayStatus
        : timestamps.departureDelayStatus;
  const delayValue =
    progress > 0
      ? timestamps.arrivalDelayValue
      : timestamps.departureDelayValue;
  const delay =
    progress > 0 ? timestamps.arrivalDelay : timestamps.departureDelay;
  return {
    ...flight,
    ...timestamps,
    user: {
      avatar: fetchGravatarUrl(flight.user.email),
      ...excludeKeys(
        flight.user,
        'admin',
        'password',
        'id',
        'pushNotifications',
        'passwordResetToken',
        'passwordResetAt',
      ),
    },
    tailNumber: flight.airframe?.registration ?? flight.tailNumber,
    flightNumberString:
      flight.flightNumber !== null
        ? `${flight.airline?.iata ?? flight.airline?.icao ?? ''} ${
            flight.flightNumber
          }`.trim()
        : '',
    distance: Math.round(flightDistance),
    link: `/user/${flight.user.username}/flights/${flight.id}`,
    minutesToDeparture,
    minutesToTakeoff,
    minutesToArrival,
    minutesToLanding,
    durationToDepartureString: getDurationString(minutesToDeparture),
    durationToDepartureAbbrString: getDurationString(minutesToDeparture, true),
    durationToArrivalString: getDurationString(minutesToArrival),
    durationToArrivalAbbrString: getDurationString(minutesToArrival, true),
    durationToTakeoffString: getDurationString(minutesToTakeoff),
    durationToLandingString: getDurationString(minutesToLanding),
    progress,
    flightProgress,
    flightStatus,
    delay,
    delayValue,
    delayStatus,
    estimatedLocation,
    estimatedHeading,
  };
};

export const getActiveFlight = (
  flights: FlightData[],
): FlightData | undefined =>
  flights.find((currentFlight, index, allFlights) => {
    const departureTime = currentFlight.outTimeActual ?? currentFlight.outTime;
    const arrivalTime = currentFlight.inTimeActual ?? currentFlight.inTime;
    if (
      isBefore(departureTime, new Date()) &&
      isAfter(arrivalTime, new Date())
    ) {
      return true;
    }
    const nextFlight = allFlights[index + 1];
    if (nextFlight === undefined) return true;
    const nextFlightTime = nextFlight.outTimeActual ?? nextFlight.outTime;
    const layoverDuration = nextFlightTime.getTime() - arrivalTime.getTime();
    const midTime = arrivalTime.getTime() + layoverDuration / 3;
    return isAfter(midTime, new Date());
  });

export const getFromDate = (
  input: GetProfileFiltersRequest,
): Date | undefined => {
  if (input.range === 'all') return undefined;
  if (input.range === 'pastMonth') return sub(new Date(), { months: 1 });
  if (input.range === 'pastYear') return sub(new Date(), { years: 1 });
  if (input.range === 'customMonth') {
    const year = parseInt(input.year, 10);
    const month = parseInt(input.month, 10);
    return startOfMonth(new Date(year, month - 1));
  }
  if (input.range === 'customYear') {
    const year = parseInt(input.year, 10);
    return startOfYear(new Date(year, 0));
  }
  if (input.range === 'customRange') {
    return new Date(input.fromDate);
  }
};

export const getToDate = (input: GetProfileFiltersRequest): Date => {
  if (input.range === 'customMonth') {
    const year = parseInt(input.year, 10);
    const month = parseInt(input.month, 10);
    const toDate = endOfMonth(new Date(year, month - 1));
    return min([toDate, new Date()]);
  }
  if (input.range === 'customYear') {
    const year = parseInt(input.year, 10);
    const toDate = endOfYear(new Date(year, 0));
    return min([toDate, new Date()]);
  }
  if (input.range === 'customRange') {
    return new Date(input.toDate);
  }
  return new Date();
};
