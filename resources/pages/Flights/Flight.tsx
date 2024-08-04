import React from 'react';
import { trpc } from '../../utils/trpc';
import { useParams } from 'react-router-dom';

export interface TripInterface {
  flightId: string | undefined;
}

export const Flight = (): JSX.Element => {
  const { flightId } = useParams();

  const { data, isLoading } = trpc.flights.getFlight.useQuery({
    id: flightId ?? '',
  });

  if (isLoading) {
    return (
      <div className="flex flex-1 justify-center pt-8">
        <span className="loading loading-spinner" />
      </div>
    );
  }

  return (
    <div className="mt-16 flex flex-col items-stretch gap-6 p-2 sm:p-3">
      Flight:
      {data?.id}
      {data?.flightNumber}
      {data?.departureAirport.iata}
      {data?.arrivalAirport.iata}
    </div>
  );
};
