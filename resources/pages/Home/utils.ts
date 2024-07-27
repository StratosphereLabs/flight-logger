import { type FlightsRouterOutput } from '../../../app/routes/flights';

export const getFollowingFlightData =
  ({
    hoverAirportId,
    selectedAirportId,
  }: {
    hoverAirportId: string | null;
    selectedAirportId: string | null;
  }) =>
  (
    flight: FlightsRouterOutput['getFollowingFlights']['flights'][number],
  ): FlightsRouterOutput['getFollowingFlights']['flights'][number] & {
    isHover: boolean;
    isSelected: boolean;
  } => ({
    ...flight,
    isHover:
      flight.departureAirportId === hoverAirportId ||
      flight.arrivalAirportId === hoverAirportId,
    isSelected:
      flight.departureAirportId === selectedAirportId ||
      flight.arrivalAirportId === selectedAirportId,
  });

export const sortByDepartureTimeAsc = (
  a: FlightsRouterOutput['getFollowingFlights']['flights'][number],
  b: FlightsRouterOutput['getFollowingFlights']['flights'][number],
): number => {
  const outTimeA = new Date(a.outTimeActual ?? a.outTime);
  const outTimeB = new Date(b.outTimeActual ?? b.outTime);
  return outTimeA.getTime() - outTimeB.getTime();
};

export const sortByArrivalTimeDesc = (
  a: FlightsRouterOutput['getFollowingFlights']['flights'][number],
  b: FlightsRouterOutput['getFollowingFlights']['flights'][number],
): number => {
  const inTimeA = new Date(a.inTimeActual ?? a.inTime);
  const inTimeB = new Date(b.inTimeActual ?? b.inTime);
  return inTimeB.getTime() - inTimeA.getTime();
};
