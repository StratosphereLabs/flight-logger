import { differenceInMinutes } from 'date-fns';
import { prisma } from '../../db';
import { type FlightWithData } from '../updateFlights';
import { createNewDate } from '../utils';
import { fetchFlightAwareData } from './fetchFlightAwareData';

export const updateFlightTimes = async (
  flights: FlightWithData[],
): Promise<void> => {
  const data = await fetchFlightAwareData(flights[0]);
  if (data === null) {
    console.error('  Unable to fetch flight data. Please try again later.');
    return;
  }
  const flightAwareFlightData = Object.values(data.flights)[0];
  const outTimeScheduled = createNewDate(
    flightAwareFlightData.gateDepartureTimes.scheduled,
  );
  if (flightAwareFlightData.origin.icao !== flights[0].departureAirportId) {
    console.error('  Departure airport does not match.');
    return;
  }
  if (flightAwareFlightData.destination.icao !== flights[0].arrivalAirportId) {
    console.error('  Arrival airport does not match.');
    return;
  }
  const timeDiff = Math.abs(
    differenceInMinutes(flights[0].outTime, outTimeScheduled),
  );
  if (timeDiff >= 720) {
    console.error('  Flight must be within 12 hours.');
    return;
  }
  await prisma.flight.updateMany({
    where: {
      id: {
        in: flights.map(({ id }) => id),
      },
    },
    data: {
      outTime: outTimeScheduled,
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
      inTime: createNewDate(flightAwareFlightData.gateArrivalTimes.scheduled),
      inTimeActual: createNewDate(
        flightAwareFlightData.gateArrivalTimes.actual ??
          flightAwareFlightData.gateArrivalTimes.estimated,
      ),
    },
  });
};
