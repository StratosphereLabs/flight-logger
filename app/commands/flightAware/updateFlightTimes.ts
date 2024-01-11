import { differenceInMinutes } from 'date-fns';
import { prisma } from '../../db';
import { getDurationMinutes } from '../../utils';
import { type FlightWithData } from '../updateData';
import { createNewDate, getGroupedFlightsKey } from '../utils';
import { fetchFlightAwareData } from './fetchFlightAwareData';

export const updateFlightTimes = async (
  flights: FlightWithData[],
): Promise<void> => {
  const data = await fetchFlightAwareData(flights[0]);
  if (data === null) {
    console.error(
      `  Unable to fetch flight data for ${getGroupedFlightsKey(
        flights[0],
      )}. Please try again later.`,
    );
    return;
  }
  const flightAwareFlightData = Object.values(
    data.flights,
  )[0].activityLog.flights.find(
    ({ destination, origin, gateDepartureTimes }) => {
      const timeDiff = Math.abs(
        differenceInMinutes(
          createNewDate(gateDepartureTimes.scheduled),
          flights[0].outTime,
        ),
      );
      return (
        origin.icao === flights[0].departureAirportId &&
        destination.icao === flights[0].arrivalAirportId &&
        timeDiff < 720
      );
    },
  );
  if (flightAwareFlightData === undefined) {
    console.error(
      `  Flight times data not found for ${getGroupedFlightsKey(
        flights[0],
      )}. Please try again later.`,
    );
    return;
  }
  const outTime = createNewDate(
    flightAwareFlightData.gateDepartureTimes.scheduled,
  );
  const inTime = createNewDate(
    flightAwareFlightData.gateArrivalTimes.scheduled,
  );
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
      outTimeActual: createNewDate(
        flightAwareFlightData.gateDepartureTimes.actual ??
          flightAwareFlightData.gateDepartureTimes.estimated,
      ),
      offTime: createNewDate(flightAwareFlightData.takeoffTimes.scheduled),
      offTimeActual: createNewDate(
        flightAwareFlightData.takeoffTimes.actual ??
          flightAwareFlightData.takeoffTimes.estimated,
      ),
      onTime: createNewDate(flightAwareFlightData.landingTimes.scheduled),
      onTimeActual: createNewDate(
        flightAwareFlightData.landingTimes.actual ??
          flightAwareFlightData.landingTimes.estimated,
      ),
      inTime,
      inTimeActual: createNewDate(
        flightAwareFlightData.gateArrivalTimes.actual ??
          flightAwareFlightData.gateArrivalTimes.estimated,
      ),
    },
  });
};
