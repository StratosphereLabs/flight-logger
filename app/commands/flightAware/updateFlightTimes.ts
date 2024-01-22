import { differenceInMinutes } from 'date-fns';
import { prisma, updateTripTimes } from '../../db';
import { getDurationMinutes } from '../../utils';
import { fetchFlightStatsData } from '../flightStats';
import { type FlightWithData } from '../updateData';
import { getGroupedFlightsKey } from '../utils';

export const updateFlightTimes = async (
  flights: FlightWithData[],
): Promise<void> => {
  const data = await fetchFlightStatsData(flights[0]);
  if (data === null) {
    console.error(
      `  Unable to fetch flight data for ${getGroupedFlightsKey(
        flights[0],
      )}. Please try again later.`,
    );
    return;
  }
  const flightStatsFlightData = data.props.initialState.flightTracker.otherDays
    .flatMap(day => day.flights)
    .find(({ arrivalAirport, departureAirport, sortTime }) => {
      const timeDiff = Math.abs(
        differenceInMinutes(new Date(sortTime), flights[0].outTime),
      );
      return (
        departureAirport.iata === flights[0].departureAirport.iata &&
        arrivalAirport.iata === flights[0].arrivalAirport.iata &&
        timeDiff < 720
      );
    });
  if (flightStatsFlightData === undefined) {
    console.error(
      `  Flight times data not found for ${getGroupedFlightsKey(
        flights[0],
      )}. Please try again later.`,
    );
    return;
  }
  const flightData = await fetchFlightStatsData(
    flights[0],
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
  const { schedule } = flightData.props.initialState.flightTracker.flight;
  const outTime = new Date(schedule.scheduledDepartureUTC);
  const outTimeActual =
    schedule.estimatedActualDepartureUTC !== null
      ? new Date(schedule.estimatedActualDepartureUTC)
      : null;
  const inTime = new Date(schedule.scheduledArrivalUTC);
  const inTimeActual =
    schedule.estimatedActualArrivalUTC !== null
      ? new Date(schedule.estimatedActualArrivalUTC)
      : null;
  const duration = getDurationMinutes({
    start: outTime,
    end: inTime,
  });
  await prisma.flight.updateMany({
    where: {
      id: {
        in: flights.map(({ id }) => id),
      },
    },
    data: {
      duration,
      outTime,
      outTimeActual,
      inTime,
      inTimeActual,
    },
  });
  await Promise.all(
    flights.flatMap(({ tripId }) =>
      tripId !== null ? updateTripTimes(tripId) : [],
    ),
  );
};
