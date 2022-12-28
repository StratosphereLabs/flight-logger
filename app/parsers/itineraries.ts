import { aircraft_type, airline, airport, FlightClass } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { isBefore } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { DataFetchResults } from './fetchData';
import { AddItineraryRequest } from '../schemas/itineraries';
import { getDurationMinutes, getFlightTimestamps } from '../utils/datetime';

export interface GetItineraryDataOptions {
  input: AddItineraryRequest;
  data: DataFetchResults;
}

export interface ItineraryResult {
  layoverDuration: number;
  departureAirport: airport;
  arrivalAirport: airport;
  outTime: Date;
  inTime: Date;
  duration: number;
  airline: airline | null;
  flightNumber: number | null;
  aircraftType: aircraft_type | null;
  class: FlightClass | null;
}

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
    const outTime = utcToZonedTime(
      timestamps.outTime,
      departureAirport.timeZone,
    );
    const inTime = utcToZonedTime(timestamps.inTime, arrivalAirport.timeZone);
    const duration = getDurationMinutes({
      start: 0,
      end: timestamps.duration * 60 * 1000,
    });
    return {
      layoverDuration,
      departureAirport,
      arrivalAirport,
      outTime,
      inTime,
      duration,
      airline,
      flightNumber: flight.flightNumber,
      aircraftType,
      class: flight.class,
    };
  });
};
