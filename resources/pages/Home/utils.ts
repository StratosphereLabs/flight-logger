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
