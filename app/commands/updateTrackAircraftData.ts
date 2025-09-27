import { isAfter, isBefore, sub } from 'date-fns';
import groupBy from 'lodash.groupby';

import {
  type FlightRadarRegistrationData,
  fetchFlightRadarRegistrationData,
} from '../data/flightRadar';
import { prisma } from '../db';
import type { FlightWithData } from './types';
import { getGroupedFlightsKey, trackAircraftFlightIncludeObj } from './utils';

export const updateTrackAircraftData = async (
  flights: FlightWithData[],
): Promise<FlightWithData[]> => {
  if (flights[0].airline === null || flights[0].flightNumber === null) {
    console.log('Airline and flight number are required.');
    return flights;
  }
  if (process.env.DATASOURCE_FLIGHTRADAR === 'true') {
    const flightDataString = getGroupedFlightsKey(flights[0]);
    console.log(`Fetching flight registration data for ${flightDataString}...`);
    let registrationData: FlightRadarRegistrationData | null = null;
    if (flights[0].tailNumber !== null) {
      try {
        registrationData = await fetchFlightRadarRegistrationData(
          flights[0].tailNumber,
        );
      } catch (err) {
        console.error(err);
      }
    }
    if (registrationData === null) {
      console.log(`Unable to fetch aircraft data for ${flights[0].tailNumber}`);
      return flights;
    }
    const filteredData = registrationData.flights.filter(
      ({ outTime }) =>
        isBefore(outTime, flights[0].outTime) &&
        isAfter(outTime, sub(flights[0].outTime, { days: 1 })) &&
        isAfter(outTime, sub(new Date(), { hours: 12 })),
    );
    const airportIataCodes = [
      ...new Set(
        filteredData.flatMap(({ departureAirportIATA, arrivalAirportIATA }) => [
          departureAirportIATA,
          arrivalAirportIATA,
        ]),
      ),
    ];
    const airports = await prisma.airport.findMany({
      where: {
        iata: {
          in: airportIataCodes,
        },
      },
      select: {
        id: true,
        iata: true,
        timeZone: true,
      },
    });
    const aircraftType =
      registrationData.aircraftData.typeCode !== undefined
        ? await prisma.aircraftType.findFirst({
            where: {
              icao: registrationData.aircraftData.typeCode,
            },
            select: {
              id: true,
            },
          })
        : null;
    const existingFlights =
      flights[0].airframeId !== null
        ? await prisma.flight.findMany({
            where: {
              userId: null,
              airframeId: flights[0].airframeId,
              AND: [
                {
                  outTime: {
                    lt: flights[0].outTime,
                    gt: sub(flights[0].outTime, { days: 1 }),
                  },
                },
                {
                  outTime: {
                    gt: sub(new Date(), { hours: 12 }),
                  },
                },
              ],
            },
            select: {
              id: true,
              departureAirportId: true,
              arrivalAirportId: true,
              flightNumber: true,
              outTime: true,
              airline: true,
              departureAirport: true,
            },
          })
        : null;
    const groupedAirports = groupBy(airports, 'iata');
    const groupedExistingFlights = groupBy(
      existingFlights,
      getGroupedFlightsKey,
    );
    const newFlightData = filteredData.flatMap(flight => {
      const departureAirport =
        groupedAirports[flight.departureAirportIATA]?.[0];
      const arrivalAirport = groupedAirports[flight.arrivalAirportIATA]?.[0];
      const diversionAirport =
        flight.diversionIata !== null
          ? groupedAirports[flight.diversionIata]?.[0]
          : null;
      if (departureAirport === undefined || arrivalAirport === undefined)
        return [];
      return {
        airlineId: flights[0].airline?.id,
        flightNumber: flight.flightNumber,
        departureAirport,
        departureAirportId: departureAirport.id,
        arrivalAirportId: arrivalAirport.id,
        outTime: flight.outTime,
        offTimeActual: flight.offTimeActual,
        onTimeActual: flight.onTimeActual,
        inTime: flight.inTime,
        aircraftTypeId: aircraftType?.id ?? null,
        airframeId: flights[0].airframeId,
        tailNumber: flights[0].tailNumber,
        diversionAirportId: diversionAirport?.id ?? null,
      };
    });
    return await prisma.$transaction(
      newFlightData.map(({ departureAirport, ...flight }) => {
        const key = getGroupedFlightsKey({
          airline: flights[0].airline,
          departureAirportId: flight.departureAirportId,
          arrivalAirportId: flight.arrivalAirportId,
          flightNumber: flight.flightNumber,
          outTime: flight.outTime,
          departureAirport,
        });
        const existingFlight = groupedExistingFlights[key]?.[0];
        if (existingFlight !== undefined) {
          return prisma.flight.update({
            where: {
              id: existingFlight.id,
            },
            data: flight,
            include: trackAircraftFlightIncludeObj,
          });
        }
        return prisma.flight.create({
          data: flight,
          include: trackAircraftFlightIncludeObj,
        });
      }),
    );
  }
  return flights;
};
