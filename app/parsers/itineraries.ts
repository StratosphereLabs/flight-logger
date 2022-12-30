import { aircraft_type, airline, airport, FlightClass } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { isBefore } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { DataFetchResults } from './fetchData';
import { DATE_FORMAT, TIME_FORMAT } from '../constants';
import { AddItineraryRequest, ItineraryFlight } from '../schemas/itineraries';
import {
  FlightTimestampsResult,
  getDurationMinutes,
  getFlightTimestamps,
} from '../utils/datetime';

export interface GetItineraryDataOptions {
  input: AddItineraryRequest;
  data: DataFetchResults;
}

export interface ItineraryResult {
  segmentTitle: string;
  layoverDuration: number;
  departureAirport: airport;
  arrivalAirport: airport;
  outDate: string;
  outTime: string;
  inTime: string;
  daysAdded: number;
  duration: number;
  airline: airline | null;
  flightNumber: number | null;
  aircraftType: aircraft_type | null;
  class: FlightClass | null;
}

const getSegmentedFlights = ({
  flights,
  flightTimestamps,
}: {
  flights: ItineraryFlight[];
  flightTimestamps: FlightTimestampsResult[];
}): ItineraryFlight[][] =>
  flights.reduce(
    (acc: ItineraryFlight[][], flight, index) => {
      const prevTimestamps = flightTimestamps[index - 1];
      const timestamps = flightTimestamps[index];
      if (
        prevTimestamps !== undefined &&
        isBefore(timestamps.outTime, prevTimestamps.inTime)
      ) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Flights must be in chronological order',
        });
      }
      const layoverDuration = getDurationMinutes({
        start:
          prevTimestamps !== undefined
            ? prevTimestamps.inTime
            : timestamps.outTime,
        end: timestamps.outTime,
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
  const flightTimestamps = input.map(flight =>
    getFlightTimestamps({
      departureAirport: data.airports[flight.departureAirportId],
      arrivalAirport: data.airports[flight.arrivalAirportId],
      outDate: flight.outDate,
      outTime: flight.outTime,
      offTime: flight.outTime,
      onTime: flight.inTime,
      inTime: flight.inTime,
    }),
  );
  const segmentedFlights = getSegmentedFlights({
    flights: input,
    flightTimestamps,
  });
  console.log(segmentedFlights);
  return input.map((flight, index) => {
    const departureAirport = data.airports[flight.departureAirportId];
    const arrivalAirport = data.airports[flight.arrivalAirportId];
    const aircraftType =
      flight.aircraftTypeId.length > 0
        ? data.aircraftTypes[flight.aircraftTypeId][0]
        : null;
    const airline =
      flight.airlineId.length > 0 ? data.airlines[flight.airlineId] : null;
    const prevTimestamps = flightTimestamps[index - 1];
    const timestamps = flightTimestamps[index];
    const layoverDuration = getDurationMinutes({
      start:
        prevTimestamps !== undefined
          ? prevTimestamps.inTime
          : timestamps.outTime,
      end: timestamps.outTime,
    });
    const outDate = formatInTimeZone(
      timestamps.outTime,
      departureAirport.timeZone,
      DATE_FORMAT,
    );
    const outTime = formatInTimeZone(
      timestamps.outTime,
      departureAirport.timeZone,
      TIME_FORMAT,
    );
    const inDate = formatInTimeZone(
      timestamps.inTime,
      arrivalAirport.timeZone,
      DATE_FORMAT,
    );
    const inTime = formatInTimeZone(
      timestamps.inTime,
      arrivalAirport.timeZone,
      TIME_FORMAT,
    );
    return {
      segmentTitle: '',
      layoverDuration,
      departureAirport,
      arrivalAirport,
      outDate,
      outTime,
      inTime,
      daysAdded: inDate === outDate ? 0 : 1,
      duration: timestamps.duration,
      airline,
      flightNumber: flight.flightNumber,
      aircraftType,
      class: flight.class,
    };
  });
};
