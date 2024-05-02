import {
  type itinerary,
  type aircraft_type,
  type airline,
  type airport,
  type itinerary_flight,
} from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { isBefore } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { DATE_FORMAT } from '../constants';
import {
  getDaysToAdd,
  getDurationDays,
  getDurationMinutes,
  getDurationString,
  getInFuture,
} from './datetime';
import { calculateDistance } from './distance';
import { getFlightTimestamps } from './flighttime';

export const itinerariesIncludeObj = {
  flights: {
    include: {
      departureAirport: true,
      arrivalAirport: true,
      airline: true,
      aircraftType: true,
    },
    orderBy: {
      outTime: 'asc' as const,
    },
  },
};

export interface ItineraryFlightData extends itinerary_flight {
  departureAirport: airport;
  arrivalAirport: airport;
  airline: airline | null;
  aircraftType: aircraft_type | null;
}

export interface ItineraryFlightResult
  extends Omit<ItineraryFlightData, 'outTime' | 'inTime'> {
  segmentTitle: string;
  layoverDuration: string;
  outDate: string;
  outTime: string;
  inTime: string;
  daysAdded: number;
  durationString: string;
}

export interface ItineraryWithData extends itinerary {
  flights: ItineraryFlightData[];
}

export interface ItineraryResult extends itinerary {
  distance: number;
  numFlights: number;
  itineraryDuration: string;
  outDateLocal: string;
  inFuture: boolean;
  flights: ItineraryFlightResult[];
}

const getSegmentedFlights = (
  flights: ItineraryFlightData[],
): ItineraryFlightData[][] =>
  flights.reduce<ItineraryFlightData[][]>(
    (acc, flight, index) => {
      const prevFlight = flights[index - 1];
      if (
        prevFlight !== undefined &&
        isBefore(flight.outTime, prevFlight.inTime)
      ) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Flights must be in chronological order',
        });
      }
      const layoverDuration = getDurationMinutes({
        start: prevFlight !== undefined ? prevFlight.inTime : flight.outTime,
        end: flight.outTime,
      });
      if (layoverDuration >= 8 * 60) {
        acc.push([]);
      }
      acc[acc.length - 1].push(flight);
      return acc;
    },
    [[]],
  );

export const transformItineraryData = (
  itinerary: ItineraryWithData,
): ItineraryResult => {
  const segmentedFlights = getSegmentedFlights(itinerary.flights);
  const itineraryFlightsResult = segmentedFlights.flatMap(segment => {
    const firstFlight = segment[0];
    const lastFlight = segment[segment.length - 1];
    const firstAirport = firstFlight.departureAirport;
    const lastAirport = lastFlight.arrivalAirport;
    const segmentTitle = `${firstAirport.municipality} (${firstAirport.iata}) to ${lastAirport.municipality} (${lastAirport.iata})`;
    return segment.map((flight, index) => {
      const departureAirport = flight.departureAirport;
      const arrivalAirport = flight.arrivalAirport;
      const prevFlight = segment[index - 1];
      const distance = calculateDistance(
        flight.departureAirport.lat,
        flight.departureAirport.lon,
        flight.arrivalAirport.lat,
        flight.arrivalAirport.lon,
      );
      const layoverDuration = getDurationString(
        getDurationMinutes({
          start: prevFlight !== undefined ? prevFlight.inTime : flight.outTime,
          end: flight.outTime,
        }),
      );
      const daysAdded = getDaysToAdd({
        outTime: flight.outTime,
        inTime: flight.inTime,
      });
      const { durationString, outDateLocal, outTimeLocal, inTimeLocal } =
        getFlightTimestamps({
          departureTimeZone: departureAirport.timeZone,
          arrivalTimeZone: arrivalAirport.timeZone,
          duration: flight.duration,
          outTime: flight.outTime,
          inTime: flight.inTime,
        });
      return {
        ...flight,
        distance,
        segmentTitle: index === 0 ? segmentTitle : '',
        layoverDuration,
        outDate: outDateLocal,
        outTime: outTimeLocal,
        inTime: inTimeLocal,
        daysAdded,
        durationString,
      };
    });
  });
  const totalDistance = itineraryFlightsResult.reduce(
    (acc, { distance }) => acc + distance,
    0,
  );
  return {
    ...itinerary,
    distance: Math.round(totalDistance),
    numFlights: itinerary.flights.length,
    itineraryDuration: getDurationDays({
      start: itinerary.flights[0].outTime,
      end: itinerary.flights[itinerary.flights.length - 1].inTime,
    }),
    outDateLocal: formatInTimeZone(
      itinerary.flights[0].outTime,
      itinerary.flights[0].departureAirport.timeZone,
      DATE_FORMAT,
    ),
    inFuture: getInFuture(itinerary.flights[0].outTime),
    flights: itineraryFlightsResult,
  };
};
