import { TRPCError } from '@trpc/server';
import { intervalToDuration, isBefore } from 'date-fns';
import { AddItineraryRequest, ItineraryFlight } from '../schemas/itineraries';
import { getFlightTimestamps } from '../utils/datetime';
import { DataFetchResults } from './fetchData';

export interface GetItineraryDataOptions {
  input: AddItineraryRequest;
  data: DataFetchResults;
}

export interface ItineraryResult extends ItineraryFlight {
  layoverDuration: number;
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
    const layoverDuration = intervalToDuration({
      start:
        prevTimestamps !== undefined
          ? prevTimestamps.inTime
          : timestamps.outTime,
      end: timestamps.outTime,
    });
    return {
      ...flight,
      layoverDuration:
        60 * (layoverDuration.hours ?? 0) + (layoverDuration.minutes ?? 0),
    };
  });
};
