import { differenceInMinutes } from 'date-fns';
import { prisma } from '../../db';
import { type FlightWithData } from '../updateFlights';
import { fetchRegistrationData } from './fetchRegistrationData';

export const updateFlightRegistrations = async (
  flights: FlightWithData[],
): Promise<void> => {
  const registrationData = await fetchRegistrationData(flights[0]);
  if (registrationData.length === 0) {
    console.error(
      '  Unable to fetch registration data. Please try again later.',
    );
    return;
  }
  const flight = registrationData.find(({ departureTime }) => {
    const timeDiff = Math.abs(
      differenceInMinutes(departureTime, flights[0].outTime),
    );
    return timeDiff < 120;
  });
  if (flight === undefined) {
    console.error(
      '  Unable to find registration from FlightRadar24. Please try again later.',
    );
    return;
  }
  const airframe = await prisma.airframe.findFirst({
    where: {
      registration: flight.registration,
    },
  });
  if (airframe === null) {
    console.error(
      '  Unable to find registration in database. Please try again later.',
    );
    return;
  }
  await prisma.flight.updateMany({
    where: {
      id: {
        in: flights.map(({ id }) => id),
      },
    },
    data: {
      airframeId: airframe.icao24,
    },
  });
};
