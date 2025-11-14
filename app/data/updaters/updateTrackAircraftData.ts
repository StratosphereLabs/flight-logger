import { isAfter, isBefore, isEqual, sub } from 'date-fns';
import groupBy from 'lodash.groupby';

import { prisma } from '../../db';
import { getDurationMinutes } from '../../utils';
import {
  type FlightRadarRegistrationData,
  fetchFlightRadarRegistrationData,
} from '../flightRadar';
import type { FlightWithData } from '../types';
import { getGroupedFlightsKey, trackAircraftFlightIncludeObj } from '../utils';

export const updateTrackAircraftData = async (
  flights: FlightWithData[],
): Promise<void> => {
  const outTimeActual = flights[0].outTimeActual ?? flights[0].outTime;
  const shouldUpdateTrackAircraft =
    flights[0].airframeId !== null &&
    flights.some(({ userId }) => userId !== null) &&
    isBefore(new Date(), outTimeActual) &&
    isAfter(new Date(), sub(outTimeActual, { days: 2 }));
  if (!shouldUpdateTrackAircraft) {
    return;
  }
  if (process.env.DATASOURCE_FLIGHTRADAR === 'true') {
    const flightDataString = getGroupedFlightsKey(flights[0]);
    console.log(`Fetching aircraft flight data for ${flightDataString}...`);
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
      console.log(
        `  Unable to fetch aircraft flight data for ${flightDataString}`,
      );
      return;
    }
    const filteredData = registrationData.flights.filter(
      ({ flightStatus, outTime }) => {
        const oneDayBeforeDeparture = sub(flights[0].outTime, { days: 1 });
        return (
          flightStatus !== 'CANCELED' &&
          isBefore(outTime, flights[0].outTime) &&
          (isEqual(outTime, oneDayBeforeDeparture) ||
            isAfter(outTime, oneDayBeforeDeparture))
        );
      },
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
        lat: true,
        lon: true,
        elevation: true,
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
    const existingFlights = await prisma.flight.findMany({
      where: {
        userId: null,
        airframeId: flights[0].airframeId,
        outTime: {
          lt: flights[0].outTime,
          gte: sub(flights[0].outTime, { days: 1 }),
        },
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
    });
    const groupedAirports = groupBy(airports, 'iata');
    const groupedExistingFlights = groupBy(
      existingFlights,
      getGroupedFlightsKey,
    );
    console.log(groupedExistingFlights);
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
        duration: getDurationMinutes({
          start: flight.outTime,
          end: flight.inTime,
        }),
        aircraftTypeId: aircraftType?.id ?? null,
        airframeId: flights[0].airframeId,
        tailNumber: flights[0].tailNumber,
        diversionAirportId: diversionAirport?.id ?? null,
      };
    });
    console.log({ newFlightData });
    await prisma.$transaction(
      newFlightData.map(({ departureAirport, ...flight }) => {
        const key = getGroupedFlightsKey({
          airline: flights[0].airline,
          departureAirport,
          ...flight,
        });
        console.log({ key });
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
    console.log(
      `  Upserted ${newFlightData.length} track aircraft flights for ${flights[0].tailNumber}.`,
    );
    const newFlightKeys = new Set(
      newFlightData.map(flight =>
        getGroupedFlightsKey({
          airline: flights[0].airline,
          ...flight,
        }),
      ),
    );
    const flightIdsToDelete = existingFlights?.reduce<string[]>(
      (acc, flight) =>
        !newFlightKeys.has(getGroupedFlightsKey(flight))
          ? [...acc, flight.id]
          : acc,
      [],
    );
    if (flightIdsToDelete !== undefined && flightIdsToDelete.length > 0) {
      await prisma.flight.deleteMany({
        where: {
          id: {
            in: flightIdsToDelete,
          },
        },
      });
      console.log(
        `  Deleted ${flightIdsToDelete.length} outdated track aircraft flights for ${flights[0].tailNumber}.`,
      );
    }
  }
};
