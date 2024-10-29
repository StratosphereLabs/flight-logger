import {
  type Airframe,
  type AircraftType,
  type Airline,
  type Airport,
} from '@prisma/client';
import groupBy from 'lodash.groupby';
import keyBy from 'lodash.keyby';
import { prisma } from './prisma';

export interface FlightDataFetchInput {
  airportIds: string[];
  airportSearchType: 'id' | 'iata';
  airlineIds: string[];
  airlineSearchType: 'id' | 'icao';
  aircraftTypeData: string[];
  aircraftSearchType: 'id' | 'icao';
  registrations?: string[];
}

export interface FlightDataFetchResults {
  airports: Record<string, Airport>;
  airlines: Record<string, Airline>;
  aircraftTypes: Record<string, AircraftType[]>;
  airframes: Record<string, Airframe>;
}

export const fetchFlightData = async ({
  airportIds,
  airportSearchType,
  airlineIds,
  airlineSearchType,
  aircraftTypeData,
  aircraftSearchType,
  registrations,
}: FlightDataFetchInput): Promise<FlightDataFetchResults> => {
  const [airports, airlines, aircraftTypes, airframes] =
    await prisma.$transaction([
      prisma.airport.findMany({
        where: {
          id:
            airportSearchType === 'id'
              ? {
                  in: airportIds,
                }
              : undefined,
          iata:
            airportSearchType === 'iata'
              ? {
                  in: airportIds,
                }
              : undefined,
        },
      }),
      prisma.airline.findMany({
        where: {
          id:
            airlineSearchType === 'id'
              ? {
                  in: airlineIds,
                }
              : undefined,
          icao:
            airlineSearchType === 'icao'
              ? {
                  in: airlineIds,
                }
              : undefined,
        },
      }),
      prisma.aircraftType.findMany({
        where: {
          id:
            aircraftSearchType === 'id'
              ? {
                  in: aircraftTypeData,
                }
              : undefined,
          icao:
            aircraftSearchType === 'icao'
              ? {
                  in: aircraftTypeData,
                }
              : undefined,
        },
      }),
      prisma.airframe.findMany({
        where: {
          registration: {
            in: registrations ?? [],
          },
        },
      }),
    ]);
  return {
    airports: keyBy(airports, airportSearchType),
    airlines: keyBy(airlines, airlineSearchType),
    aircraftTypes: groupBy(aircraftTypes, aircraftSearchType),
    airframes: keyBy(airframes, 'registration'),
  };
};
