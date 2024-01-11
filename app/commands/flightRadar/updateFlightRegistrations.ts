import { differenceInMinutes } from 'date-fns';
import { prisma } from '../../db';
import { type FlightWithData } from '../updateData';
import { getGroupedFlightsKey } from '../utils';
import { fetchRegistrationData } from './fetchRegistrationData';

export const updateFlightRegistrations = async (
  flights: FlightWithData[],
): Promise<void> => {
  const registrationData = await fetchRegistrationData(flights[0]);
  if (registrationData.length === 0) {
    console.error(
      `  Unable to fetch registration data for ${getGroupedFlightsKey(
        flights[0],
      )}. Please try again later.`,
    );
    return;
  }
  const flight = registrationData.find(
    ({ departureAirportIATA, arrivalAirportIATA, departureTime }) => {
      const timeDiff = Math.abs(
        differenceInMinutes(departureTime, flights[0].outTime),
      );
      return (
        departureAirportIATA === flights[0].departureAirport.iata &&
        arrivalAirportIATA === flights[0].arrivalAirport.iata &&
        timeDiff < 720
      );
    },
  );
  if (flight === undefined) {
    console.error(
      `  Flight registration data not found for ${getGroupedFlightsKey(
        flights[0],
      )}. Please try again later.`,
    );
    return;
  }
  const airframe = await prisma.airframe.findFirst({
    where: {
      registration: flight.registration,
    },
  });
  await prisma.flight.updateMany({
    where: {
      id: {
        in: flights.map(({ id }) => id),
      },
    },
    data: {
      airframeId: airframe !== null ? airframe.icao24 : undefined,
      tailNumber: flight.registration,
    },
  });
};
