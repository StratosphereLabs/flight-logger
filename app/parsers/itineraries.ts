import { aircraft_type, airline, airport, FlightClass } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { isBefore } from 'date-fns';
import { DataFetchResults } from './fetchData';
import { AddItineraryRequest, ItineraryFlight } from '../schemas/itineraries';
import {
  FlightTimesResult,
  getDurationMinutes,
  getDurationString,
  getFlightTimes,
  getFlightTimestamps,
} from '../utils';

export interface GetItineraryDataOptions {
  input: AddItineraryRequest;
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
  extends Omit<ItineraryFlight, 'outTime' | 'inTime'>,
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
  input,
  data,
}: GetItineraryDataOptions): ItineraryResult[] => {
  const flightsWithTimestamps: ItineraryFlightWithTimestamps[] = input.map(
    flight => ({
      ...flight,
      ...getFlightTimes({
        departureAirport: data.airports[flight.departureAirportId],
        arrivalAirport: data.airports[flight.arrivalAirportId],
        outDateISO: flight.outDateISO,
        outTimeValue: flight.outTimeValue,
        inTimeValue: flight.inTimeValue,
      }),
    }),
  );
  const segmentedFlights = getSegmentedFlights(flightsWithTimestamps);
  return segmentedFlights.flatMap(segment => {
    const firstFlight = segment[0];
    const lastFlight = segment[segment.length - 1];
    const firstAirport = data.airports[firstFlight.departureAirportId];
    const lastAirport = data.airports[lastFlight.arrivalAirportId];
    const segmentTitle = `${firstAirport.municipality} (${firstAirport.iata}) to ${lastAirport.municipality} (${lastAirport.iata})`;
    return segment.map((flight, index) => {
      const departureAirport = data.airports[flight.departureAirportId];
      const arrivalAirport = data.airports[flight.arrivalAirportId];
      const aircraftType =
        flight.aircraftTypeId.length > 0
          ? data.aircraftTypes[flight.aircraftTypeId][0]
          : null;
      const airline =
        flight.airlineId.length > 0 ? data.airlines[flight.airlineId] : null;
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
