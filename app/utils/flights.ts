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
  isEqual,
  isFuture,
  startOfMonth,
  startOfYear,
  sub,
} from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import groupBy from 'lodash.groupby';
import type { FlightAwareTracklogItem } from '../data/flightAware/types';
import { type GetProfileFiltersRequest } from '../schemas';
import { type LatLng } from '../types';
import { calculateCenterPoint, type Coordinates } from './coordinates';
import { getDurationMinutes, getDurationString } from './datetime';
import {
  calculateDistance,
  getBearing,
  getMidpoint,
  getProjectedCoords,
} from './distance';
import {
  type FlightTimestampsResult,
  getFlightTimestamps,
  type FlightDelayStatus,
} from './flighttime';
import { fetchGravatarUrl, type UserData } from './users';

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
  diversionAirport: {
    select: {
      iata: true,
      municipality: true,
      countryId: true,
      region: {
        select: {
          name: true,
        },
      },
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
  user: UserData;
  departureAirport: AirportData;
  arrivalAirport: AirportData;
  diversionAirport: {
    iata: string;
    municipality: string;
    countryId: string;
    region: {
      name: string;
    };
  } | null;
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
  midpoint: Coordinates;
}

export interface FlightsResult
  extends Array<Omit<FlightWithAirports, 'tracklog' | 'waypoints'>> {}

export interface FlightTrackingDataResult {
  tracklog: FlightAwareTracklogItem[] | undefined;
  waypoints: Array<[number, number]> | undefined;
}

export interface TransformFlightDataResult
  extends Omit<FlightData, 'tracklog' | 'user' | 'waypoints'>,
    FlightTimestampsResult,
    FlightTrackingDataResult {
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
  flightStatusText: string;
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

export const getHeatmap = (result?: FlightsResult): LatLng[] =>
  result?.flatMap(flight => [
    {
      lat: flight.departureAirport.lat,
      lng: flight.departureAirport.lon,
    },
    {
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
    isCompleted: flights.some(({ inTime }) => !isFuture(inTime)),
    midpoint: getMidpoint(
      flights[0].departureAirport.lat,
      flights[0].departureAirport.lon,
      flights[0].arrivalAirport.lat,
      flights[0].arrivalAirport.lon,
    ),
  }));
};

export const getTrackingData = (
  flight: FlightData,
): FlightTrackingDataResult => {
  const tracklog =
    flight.tracklog !== null &&
    typeof flight.tracklog === 'object' &&
    Array.isArray(flight.tracklog)
      ? (flight.tracklog as FlightAwareTracklogItem[])
      : undefined;
  const waypoints =
    flight.waypoints !== null &&
    typeof flight.waypoints === 'object' &&
    Array.isArray(flight.waypoints) &&
    flight.waypoints.length > 0
      ? (flight.waypoints as Array<[number, number]>)
      : ([
          [flight.departureAirport.lon, flight.departureAirport.lat],
          [flight.arrivalAirport.lon, flight.arrivalAirport.lat],
        ] as Array<[number, number]>);
  return { tracklog, waypoints };
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
    flight.flightRadarStatus !== 'CANCELED' && !isFuture(departureTime);
  const hasTakenOff =
    flight.flightRadarStatus !== 'CANCELED' && !isFuture(runwayDepartureTime);
  const hasLanded =
    flight.flightRadarStatus !== 'CANCELED' && !isFuture(runwayArrivalTime);
  const hasArrived =
    flight.flightRadarStatus !== 'CANCELED' && !isFuture(arrivalTime);
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
  const flightStatus = flight.flightRadarStatus ?? estimatedStatus;
  const flightStatusText =
    flight.diversionAirport !== null
      ? `Diverted to ${flight.diversionAirport.iata}`
      : FLIGHT_STATUS_MAP[flightStatus];
  const { tracklog, waypoints } = getTrackingData(flight);
  const distanceTraveled = flightProgress * flightDistance;
  const initialHeading = getBearing(
    flight.departureAirport.lat,
    flight.departureAirport.lon,
    flight.arrivalAirport.lat,
    flight.arrivalAirport.lon,
  );
  const estimatedLocation =
    tracklog !== undefined && tracklog.length > 0
      ? {
          lat: tracklog[tracklog.length - 1].coord[1],
          lng: tracklog[tracklog.length - 1].coord[0],
        }
      : getProjectedCoords(
          flight.departureAirport.lat,
          flight.departureAirport.lon,
          distanceTraveled,
          initialHeading,
        );
  const estimatedHeading =
    tracklog !== undefined && tracklog.length > 1
      ? getBearing(
          tracklog[tracklog.length - 2].coord[1],
          tracklog[tracklog.length - 2].coord[0],
          estimatedLocation.lat,
          estimatedLocation.lng,
        )
      : getBearing(
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
      ...flight.user,
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
    flightStatusText,
    delay,
    delayValue,
    delayStatus,
    estimatedLocation,
    estimatedHeading,
    tracklog,
    waypoints,
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
    const monthStart = startOfMonth(new Date(year, month - 1));
    return sub(monthStart, { days: 1 });
  }
  if (input.range === 'customYear') {
    const year = parseInt(input.year, 10);
    const yearStart = startOfYear(new Date(year, 0));
    return sub(yearStart, { days: 1 });
  }
  if (input.range === 'customRange') {
    const fromDate = new Date(input.fromDate);
    return sub(fromDate, { days: 1 });
  }
};

export const getToDate = (
  input: GetProfileFiltersRequest,
): Date | undefined => {
  if (input.range === 'all') return undefined;
  if (input.range === 'customMonth') {
    const year = parseInt(input.year, 10);
    const month = parseInt(input.month, 10);
    const monthEnd = endOfMonth(new Date(year, month - 1));
    return add(monthEnd, { days: 1 });
  }
  if (input.range === 'customYear') {
    const year = parseInt(input.year, 10);
    const yearEnd = endOfYear(new Date(year, 0));
    return add(yearEnd, { days: 1 });
  }
  if (input.range === 'customRange') {
    const toDate = new Date(input.toDate);
    return add(toDate, { days: 1 });
  }
  return new Date();
};

export const getFromStatusDate = (
  input: GetProfileFiltersRequest,
): Date | undefined => {
  return input.status === 'upcoming' ? new Date() : undefined;
};

export const getToStatusDate = (
  input: GetProfileFiltersRequest,
): Date | undefined => {
  return input.status === 'completed' ? new Date() : undefined;
};

export const filterCustomDates =
  (input: GetProfileFiltersRequest) =>
  (
    flight: Pick<flight, 'outTime'> & {
      departureAirport: Pick<airport, 'timeZone'>;
    },
  ): boolean => {
    const departureTimeLocal = utcToZonedTime(
      flight.outTime,
      flight.departureAirport.timeZone,
    );
    const day = departureTimeLocal.getDate();
    const month = departureTimeLocal.getMonth() + 1;
    const year = departureTimeLocal.getFullYear();
    switch (input.range) {
      case 'customMonth': {
        return month.toString() === input.month;
      }
      case 'customYear': {
        return year.toString() === input.year;
      }
      case 'customRange': {
        const flightDate = new Date(year, month - 1, day);
        const [fromYear, fromMonth, fromDay] = input.fromDate
          .split('-')
          .map(val => parseInt(val, 10));
        const [toYear, toMonth, toDay] = input.toDate
          .split('-')
          .map(val => parseInt(val, 10));
        const fromDate = new Date(fromYear, fromMonth - 1, fromDay);
        const toDate = new Date(toYear, toMonth - 1, toDay);
        return (
          isEqual(flightDate, fromDate) ||
          isEqual(flightDate, toDate) ||
          (isAfter(flightDate, fromDate) && isBefore(flightDate, toDate))
        );
      }
      default:
        return true;
    }
  };
