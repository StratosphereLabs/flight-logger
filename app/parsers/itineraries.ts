import { aircraft_type, airline, airport, FlightClass } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { isBefore } from 'date-fns';
import { DataFetchResults } from './fetchData';
import { ItineraryFlight } from '../schemas/itineraries';
import { WithRequiredNonNull } from '../types';
import {
  FlightTimesResult,
  getDurationMinutes,
  getDurationString,
  getFlightTimes,
  getFlightTimestamps,
} from '../utils';

export interface GetItineraryDataOptions {
  flights: ItineraryFlight[];
  data: DataFetchResults;
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
  duration: string;
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
      const { duration, outDateLocal, outTimeLocal, inTimeLocal } =
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
        duration,
        airline,
        flightNumber: flight.flightNumber,
        aircraftType,
        class: flight.class,
      };
    });
  });
};
