import type {
  AircraftType,
  Airframe,
  Airline,
  Airport,
  Flight,
  FlightRadarStatus,
  Region,
  User,
} from '@prisma/client';
import {
  add,
  endOfMonth,
  getTime,
  getUnixTime,
  isAfter,
  isBefore,
  isEqual,
  isFuture,
  sub,
} from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import groupBy from 'lodash.groupby';

import { KTS_TO_MPH } from '../commands/constants';
import { SECONDS_IN_HOUR } from '../constants';
import type { TracklogItem } from '../data/types';
import {
  type GetProfileFiltersRequest,
  type GetUserProfileStatisticsRequest,
} from '../schemas';
import { type LatLng } from '../types';
import { type Coordinates, calculateCenterPoint } from './coordinates';
import { getDurationMinutes, getDurationString } from './datetime';
import {
  calculateDistance,
  getBearing,
  getMidpoint,
  getProjectedCoords,
} from './distance';
import {
  type FlightDelayStatus,
  type FlightTimestampsResult,
  getFlightTimestamps,
} from './flighttime';
import { type UserData, fetchGravatarUrl } from './users';

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
          id: true,
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

export interface AirframeData extends Airframe {
  aircraftType: AircraftType | null;
  operator: Airline | null;
}

export interface AirportData extends Airport {
  region: Region;
}

export interface FlightData extends Flight {
  user: UserData;
  departureAirport: AirportData;
  arrivalAirport: AirportData;
  diversionAirport: {
    iata: string;
    municipality: string;
    countryId: string;
    region: {
      id: string;
      name: string;
    };
  } | null;
  airline: Airline | null;
  aircraftType: AircraftType | null;
  airframe: AirframeData | null;
}

export interface Route {
  departureAirport: Airport;
  arrivalAirport: Airport;
}

export type FlightWithAirports = Flight & Route;

export type FlightDataWithTimestamps = FlightData & FlightTimestampsResult;

export interface RouteResult {
  airports: [Airport, Airport];
  frequency: number;
  isCompleted: boolean;
  midpoint: Coordinates;
}

export interface FlightsResult
  extends Array<Omit<FlightWithAirports, 'tracklog' | 'waypoints'>> {}

export interface FlightTrackingDataResult {
  tracklog: TracklogItem[] | undefined;
  waypoints: Array<[number, number]> | undefined;
}

export interface TransformFlightDataResult
  extends Omit<FlightData, 'tracklog' | 'user' | 'waypoints'>,
    FlightTimestampsResult,
    FlightTrackingDataResult {
  user: {
    avatar: string;
  } & Omit<
    User,
    | 'admin'
    | 'password'
    | 'id'
    | 'pushNotifications'
    | 'passwordResetToken'
    | 'passwordResetAt'
  >;
  distance: number;
  flightNumberString: string;
  departureMunicipalityText: string;
  arrivalMunicipalityText: string;
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
  const airportMap: Record<string, Airport> = {};
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

export const getSearchQueryWhereInput = (
  searchQuery: string,
): Record<string, unknown> => ({
  OR: [
    {
      airline: {
        name: {
          contains: searchQuery,
          mode: 'insensitive' as const,
        },
      },
    },
    {
      airline: {
        icao: searchQuery.toUpperCase(),
      },
    },
    {
      airline: {
        iata: searchQuery.toUpperCase(),
      },
    },
    ...(!isNaN(Number(searchQuery))
      ? [
          {
            flightNumber: {
              equals: Number(searchQuery),
            },
          },
        ]
      : []),
    {
      departureAirport: {
        name: {
          contains: searchQuery,
          mode: 'insensitive' as const,
        },
      },
    },
    {
      departureAirport: {
        municipality: {
          contains: searchQuery,
          mode: 'insensitive' as const,
        },
      },
    },
    {
      departureAirportId: searchQuery.toUpperCase(),
    },
    {
      departureAirport: {
        iata: searchQuery.toUpperCase(),
      },
    },
    {
      departureAirport: {
        country: {
          name: {
            contains: searchQuery,
            mode: 'insensitive' as const,
          },
        },
      },
    },
    {
      departureAirport: {
        country: {
          id: searchQuery.toUpperCase(),
        },
      },
    },
    {
      arrivalAirport: {
        name: {
          contains: searchQuery,
          mode: 'insensitive' as const,
        },
      },
    },
    {
      arrivalAirport: {
        municipality: {
          contains: searchQuery,
          mode: 'insensitive' as const,
        },
      },
    },
    {
      arrivalAirportId: searchQuery.toUpperCase(),
    },
    {
      arrivalAirport: {
        iata: searchQuery.toUpperCase(),
      },
    },
    {
      arrivalAirport: {
        country: {
          name: {
            contains: searchQuery,
            mode: 'insensitive' as const,
          },
        },
      },
    },
    {
      arrivalAirport: {
        country: {
          id: searchQuery.toUpperCase(),
        },
      },
    },
    {
      aircraftType: {
        name: {
          contains: searchQuery,
          mode: 'insensitive' as const,
        },
      },
    },
    {
      aircraftType: {
        icao: searchQuery.toUpperCase(),
      },
    },
    {
      aircraftType: {
        iata: searchQuery.toUpperCase(),
      },
    },
    {
      tailNumber: {
        contains: searchQuery,
        mode: 'insensitive' as const,
      },
    },
  ],
});

export const getSelectedAirportWhereInput = (
  selectedAirportId: string,
): Record<string, unknown> => ({
  OR: [
    {
      departureAirportId: selectedAirportId,
    },
    {
      arrivalAirportId: selectedAirportId,
      diversionAirportId: null,
    },
    {
      diversionAirportId: selectedAirportId,
    },
  ],
});

export const getProfileFlightsWhereInput = (
  input: GetUserProfileStatisticsRequest,
  username?: string,
): Record<string, unknown> => {
  const fromDate = getFromDate(input);
  const toDate = getToDate(input);
  const fromStatusDate = getFromStatusDate(input);
  const toStatusDate = getToStatusDate(input);
  return {
    user: {
      username: input?.username ?? username,
    },
    outTime: {
      gte: fromDate,
      lte: toDate,
    },
    AND: [
      {
        OR:
          fromStatusDate !== undefined || toStatusDate !== undefined
            ? [
                {
                  inTime: {
                    gte: fromStatusDate,
                    lte: toStatusDate,
                  },
                },
                {
                  inTimeActual: {
                    gte: fromStatusDate,
                    lte: toStatusDate,
                  },
                },
              ]
            : undefined,
      },
      ...(input.searchQuery.length > 0
        ? [getSearchQueryWhereInput(input.searchQuery)]
        : []),
      ...(input.selectedAirportId !== null
        ? [getSelectedAirportWhereInput(input.selectedAirportId)]
        : []),
    ],
  };
};

export const getTrackingData = (
  flight: FlightData,
): FlightTrackingDataResult => {
  const tracklog =
    flight.tracklog !== null &&
    typeof flight.tracklog === 'object' &&
    Array.isArray(flight.tracklog)
      ? (flight.tracklog as TracklogItem[])
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

export const getAverageSpeedFromTracklog = (
  secondLastWaypoint: TracklogItem,
  lastWaypoint: TracklogItem,
): number => {
  const distanceTraveled = calculateDistance(
    secondLastWaypoint.coord[1],
    secondLastWaypoint.coord[0],
    lastWaypoint.coord[1],
    lastWaypoint.coord[0],
  );
  const timeDiffHours =
    (lastWaypoint.timestamp - secondLastWaypoint.timestamp) / SECONDS_IN_HOUR;
  return distanceTraveled / timeDiffHours;
};

export const getEstimatedSpeedFromTracklog = (
  tracklog: TracklogItem[],
): number => {
  const secondLastWaypoint = tracklog[tracklog.length - 2];
  const lastWaypoint = tracklog[tracklog.length - 1];
  const averageSpeedFromTracklog = getAverageSpeedFromTracklog(
    secondLastWaypoint,
    lastWaypoint,
  );
  return lastWaypoint.gs !== null
    ? (lastWaypoint.gs * KTS_TO_MPH + averageSpeedFromTracklog) / 2
    : averageSpeedFromTracklog;
};

export const getProjectedCoordsFromTracklog = (
  tracklog: TracklogItem[],
  estimatedSpeed: number,
): Coordinates => {
  const secondLastWaypoint = tracklog[tracklog.length - 2];
  const lastWaypoint = tracklog[tracklog.length - 1];
  const secondsSinceLastWaypoint =
    getUnixTime(new Date()) - lastWaypoint.timestamp;
  const estimatedDistanceTraveled =
    (secondsSinceLastWaypoint / SECONDS_IN_HOUR) * estimatedSpeed;
  return getProjectedCoords(
    lastWaypoint.coord[1],
    lastWaypoint.coord[0],
    estimatedDistanceTraveled,
    getBearing(
      secondLastWaypoint.coord[1],
      secondLastWaypoint.coord[0],
      lastWaypoint.coord[1],
      lastWaypoint.coord[0],
    ),
  );
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
    start: new Date(),
    end: departureTime,
  });
  const minutesToTakeoff = getDurationMinutes({
    start: new Date(),
    end: runwayDepartureTime,
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
  const departureRegion =
    flight.departureAirport.countryId === 'US' ||
    flight.departureAirport.countryId === 'CA'
      ? flight.departureAirport.region.id.split('-')[1]
      : flight.departureAirport.countryId;
  const departureMunicipalityText = `${flight.departureAirport.municipality}, ${departureRegion}`;
  const arrivalMunicipality =
    flight.diversionAirport?.municipality ?? flight.arrivalAirport.municipality;
  const arrivalAirport = flight.diversionAirport ?? flight.arrivalAirport;
  const arrivalRegion =
    arrivalAirport.countryId === 'US' || arrivalAirport.countryId === 'CA'
      ? arrivalAirport.region.id.split('-')[1]
      : arrivalAirport.countryId;
  const arrivalMunicipalityText = `${arrivalMunicipality}, ${arrivalRegion}`;
  const { tracklog, waypoints } = getTrackingData(flight);
  const distanceTraveled = flightProgress * flightDistance;
  const initialHeading = getBearing(
    flight.departureAirport.lat,
    flight.departureAirport.lon,
    flight.arrivalAirport.lat,
    flight.arrivalAirport.lon,
  );
  const estimatedSpeed =
    tracklog !== undefined && tracklog.length > 1
      ? getEstimatedSpeedFromTracklog(tracklog)
      : null;
  const estimatedLocation =
    tracklog !== undefined && tracklog.length > 1 && estimatedSpeed !== null
      ? getProjectedCoordsFromTracklog(tracklog, estimatedSpeed)
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
  const tracklogWithLocation = [
    ...(tracklog ?? []),
    ...(tracklog !== undefined &&
    tracklog.length > 0 &&
    flight.flightRadarStatus === 'EN_ROUTE'
      ? [
          {
            timestamp: getTime(new Date()),
            alt: tracklog[tracklog.length - 1]?.alt ?? 0,
            coord: [estimatedLocation.lng, estimatedLocation.lat] as [
              number,
              number,
            ],
            gs: estimatedSpeed !== null ? estimatedSpeed / KTS_TO_MPH : null,
          },
        ]
      : []),
  ];
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
    departureMunicipalityText,
    arrivalMunicipalityText,
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
    tracklog: tracklogWithLocation,
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
    const monthStart = new Date(
      `${year}-${month < 10 ? '0' : ''}${month}-01T00:00:00.000Z`,
    );
    return sub(monthStart, { days: 1 });
  }
  if (input.range === 'customYear') {
    const year = parseInt(input.year, 10);
    const yearStart = new Date(`${year}-01-01T00:00:00.000Z`);
    return sub(yearStart, { days: 1 });
  }
  if (input.range === 'customRange') {
    const fromDate = new Date(`${input.fromDate}T00:00:00.000Z`);
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
    const date = monthEnd.getDate();
    const monthEndDate = new Date(
      `${year}-${month < 10 ? '0' : ''}${month}-${date < 10 ? '0' : ''}${date}T23:59:59.999Z`,
    );
    return add(monthEndDate, { days: 1 });
  }
  if (input.range === 'customYear') {
    const year = parseInt(input.year, 10);
    const yearEnd = new Date(`${year}-12-31T23:59:59.999Z`);
    return add(yearEnd, { days: 1 });
  }
  if (input.range === 'customRange') {
    const toDate = new Date(`${input.toDate}T23:59:59.999Z`);
    return add(toDate, { days: 1 });
  }
  return new Date();
};

export const getFromStatusDate = (
  input: GetProfileFiltersRequest,
): Date | undefined => {
  return input.status === 'upcoming' &&
    input.range !== 'pastMonth' &&
    input.range !== 'pastYear' &&
    input.range !== 'customRange'
    ? new Date()
    : undefined;
};

export const getToStatusDate = (
  input: GetProfileFiltersRequest,
): Date | undefined => {
  return input.status === 'completed' &&
    input.range !== 'pastMonth' &&
    input.range !== 'pastYear' &&
    input.range !== 'customRange'
    ? new Date()
    : undefined;
};

export const filterCustomDates =
  (input: GetProfileFiltersRequest) =>
  (
    flight: Pick<Flight, 'outTime'> & {
      departureAirport: Pick<Airport, 'timeZone'>;
    },
  ): boolean => {
    const departureTimeLocal = toZonedTime(
      flight.outTime,
      flight.departureAirport.timeZone,
    );
    const day = departureTimeLocal.getDate();
    const month = departureTimeLocal.getMonth() + 1;
    const year = departureTimeLocal.getFullYear();
    switch (input.range) {
      case 'customMonth': {
        return (
          month.toString() === input.month && year.toString() === input.year
        );
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
