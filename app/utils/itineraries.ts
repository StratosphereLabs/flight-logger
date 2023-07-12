import {
  itinerary,
  type aircraft_type,
  type airline,
  type airport,
  type FlightClass,
  itinerary_flight,
} from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { isBefore } from 'date-fns';
import { getDurationMinutes, getDurationString } from './datetime';
import {
  type FlightTimesResult,
  getFlightTimes,
  getFlightTimestamps,
} from './flighttime';
import { type FlightDataFetchResults } from '../db';
import { type ItineraryFlight } from '../schemas';
import { type WithRequiredNonNull } from '../types';

export interface ItineraryFlightData extends itinerary_flight {
  departureAirport: airport;
  arrivalAirport: airport;
  airline: airline | null;
  aircraftType: aircraft_type | null;
}

export type Itinerary = itinerary & {
  flights: ItineraryFlightData[]
}

export interface GetItineraryDataOptions {
  flights: ItineraryFlight[];
  data: FlightDataFetchResults;
}

export interface ItineraryResult {
  segmentTitle: string;
  layoverDuration: string;
  departureAirport: airport;
  arrivalAirport: airport;
  outDate: string;
  outTime: string;
  inTime: string;
  daysAdded: number;
  durationString: string;
  airline: airline | null;
  flightNumber: number | null;
  aircraftType: aircraft_type | null;
  class: FlightClass | null;
}

export interface ItineraryFlightWithTimestamps
  extends WithRequiredNonNull<
      Omit<ItineraryFlight, 'outTime' | 'inTime'>,
      'departureAirport' | 'arrivalAirport'
    >,
    FlightTimesResult {}

const getSegmentedFlights = (
  flightsWithTimestamps: ItineraryFlightWithTimestamps[],
): ItineraryFlightWithTimestamps[][] =>
  flightsWithTimestamps.reduce(
    (acc: ItineraryFlightWithTimestamps[][], flight, index) => {
      const prevFlight = flightsWithTimestamps[index - 1];
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

export const getItineraryData = ({
  flights,
  data,
}: GetItineraryDataOptions): ItineraryResult[] => {
  const flightsWithTimestamps: ItineraryFlightWithTimestamps[] =
    flights.flatMap(flight => {
      const departureAirport = data.airports[flight.departureAirport?.id ?? ''];
      const arrivalAirport = data.airports[flight.arrivalAirport?.id ?? ''];
      if (departureAirport === undefined || arrivalAirport === undefined) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Departure and Arrival airports are required.',
        });
      }
      return [
        {
          ...flight,
          departureAirport,
          arrivalAirport,
          ...getFlightTimes({
            departureAirport,
            arrivalAirport,
            outDateISO: flight.outDateISO,
            outTimeValue: flight.outTimeValue,
            inTimeValue: flight.inTimeValue,
          }),
        },
      ];
    });
  const segmentedFlights = getSegmentedFlights(flightsWithTimestamps);
  return segmentedFlights.flatMap(segment => {
    const firstFlight = segment[0];
    const lastFlight = segment[segment.length - 1];
    const firstAirport = firstFlight.departureAirport;
    const lastAirport = lastFlight.arrivalAirport;
    const segmentTitle = `${firstAirport.municipality} (${firstAirport.iata}) to ${lastAirport.municipality} (${lastAirport.iata})`;
    return segment.map((flight, index) => {
      const departureAirport = flight.departureAirport;
      const arrivalAirport = flight.arrivalAirport;
      const aircraftType =
        flight.aircraftType !== null
          ? data.aircraftTypes[flight.aircraftType.id][0]
          : null;
      const airline =
        flight.airline !== null ? data.airlines[flight.airline.id] : null;
      const prevFlight = segment[index - 1];
      const layoverDuration = getDurationString(
        getDurationMinutes({
          start: prevFlight !== undefined ? prevFlight.inTime : flight.outTime,
          end: flight.outTime,
        }),
      );
      const { durationString, outDateLocal, outTimeLocal, inTimeLocal } =
        getFlightTimestamps({
          departureAirport,
          arrivalAirport,
          duration: flight.duration,
          outTime: flight.outTime,
          inTime: flight.inTime,
        });
      return {
        segmentTitle: index === 0 ? segmentTitle : '',
        layoverDuration,
        departureAirport,
        arrivalAirport,
        outDate: outDateLocal,
        outTime: outTimeLocal,
        inTime: inTimeLocal,
        daysAdded: flight.daysAdded,
        durationString,
        airline,
        flightNumber: flight.flightNumber,
        aircraftType,
        class: flight.class,
      };
    });
  });
};

export const transformUserItineraryData = ({ flights, ...itinerary }):  => {
  const flightsWithDistance = flights.map(flight => ({
    ...flight,
    distance: calculateDistance(
      flight.departureAirport.lat,
      flight.departureAirport.lon,
      flight.arrivalAirport.lat,
      flight.arrivalAirport.lon,
    ),
  }));
  const totalDistance = flightsWithDistance.reduce(
    (acc, { distance }) => acc + distance,
    0,
  );
  return {
    ...itinerary,
    flights: flightsWithDistance,
    distance: Math.round(totalDistance),
    numFlights: flights.length,
    date: flights[0].outTime,
  };
}
