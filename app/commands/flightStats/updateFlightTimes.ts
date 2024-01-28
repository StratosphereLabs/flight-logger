import { differenceInMinutes } from 'date-fns';
import { prisma, updateTripTimes } from '../../db';
import { getDurationMinutes } from '../../utils';
import { type FlightWithData } from '../updateData';
import { getGroupedFlightsKey } from '../utils';
import { fetchFlightStatsData } from './fetchFlightStatsData';

export const updateFlightTimes = async (
  flights: FlightWithData[],
): Promise<void> => {
  if (flights[0].airline === null || flights[0].flightNumber === null) {
    console.error('Airline and flight number are required.');
    return;
  }
  const data = await fetchFlightStatsData(
    flights[0].airline.iata,
    flights[0].flightNumber,
  );
  if (data === null) {
    console.error(
      `  Unable to fetch flight data for ${getGroupedFlightsKey(
        flights[0],
      )}. Please try again later.`,
    );
    return;
  }
  const { otherDays } = data.props.initialState.flightTracker;
  const flightStatsFlightData =
    typeof otherDays === 'object'
      ? otherDays
          .flatMap(day => day.flights)
          .find(({ arrivalAirport, departureAirport, sortTime }) => {
            const timeDiff = Math.abs(
              differenceInMinutes(new Date(sortTime), flights[0].outTime),
            );
            return (
              departureAirport.iata === flights[0].departureAirport.iata &&
              arrivalAirport.iata === flights[0].arrivalAirport.iata &&
              timeDiff < 360
            );
          })
      : undefined;
  if (flightStatsFlightData === undefined) {
    console.error(
      `  Flight times data not found for ${getGroupedFlightsKey(
        flights[0],
      )}. Please try again later.`,
    );
    return;
  }
  const flightData = await fetchFlightStatsData(
    flights[0].airline.iata,
    flights[0].flightNumber,
    flightStatsFlightData.url,
  );
  if (flightData === null) {
    console.error(
      `  Flight times data not found for ${getGroupedFlightsKey(
        flights[0],
      )}. Please try again later.`,
    );
    return;
  }
  const { flight } = flightData.props.initialState.flightTracker;
  const outTime = new Date(flight.schedule.scheduledDepartureUTC);
  const outTimeActual =
    flight.schedule.estimatedActualDepartureUTC !== null
      ? new Date(flight.schedule.estimatedActualDepartureUTC)
      : null;
  const inTime = new Date(flight.schedule.scheduledArrivalUTC);
  const inTimeActual =
    flight.schedule.estimatedActualArrivalUTC !== null
      ? new Date(flight.schedule.estimatedActualArrivalUTC)
      : null;
  await prisma.flight.updateMany({
    where: {
      id: {
        in: flights.map(({ id }) => id),
      },
    },
    data: {
      duration: getDurationMinutes({
        start: outTime,
        end: inTime,
      }),
      outTime,
      outTimeActual,
      inTime,
      inTimeActual,
      departureGate: flight.departureAirport.gate ?? undefined,
      arrivalGate: flight.arrivalAirport.gate ?? undefined,
      departureTerminal: flight.departureAirport.terminal ?? undefined,
      arrivalTerminal: flight.arrivalAirport.terminal ?? undefined,
      arrivalBaggage: flight.arrivalAirport.baggage ?? undefined,
    },
  });
  await Promise.all(
    flights.flatMap(({ tripId }) =>
      tripId !== null ? updateTripTimes(tripId) : [],
    ),
  );
};
