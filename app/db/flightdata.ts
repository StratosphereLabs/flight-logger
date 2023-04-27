import { aircraft_type, airline, airport } from '@prisma/client';
import groupBy from 'lodash.groupby';
import keyBy from 'lodash.keyby';
import { prisma } from './prisma';

export interface FlightDataFetchInput {
  airportIds: string[];
  airlineIds: string[];
  aircraftTypeData: string[];
  aircraftSearchType: 'id' | 'icao';
}

export interface FlightDataFetchResults {
  airports: Record<string, airport>;
  airlines: Record<string, airline>;
  aircraftTypes: Record<string, aircraft_type[]>;
}

export const fetchFlightData = async ({
  airportIds,
  airlineIds,
  aircraftTypeData,
  aircraftSearchType,
}: FlightDataFetchInput): Promise<FlightDataFetchResults> => {
  const [airports, airlines, aircraftTypes] = await prisma.$transaction([
    prisma.airport.findMany({
      where: {
        id: {
          in: airportIds,
        },
      },
    }),
    prisma.airline.findMany({
      where: {
        id:
          aircraftSearchType === 'id'
            ? {
                in: airlineIds,
              }
            : undefined,
        AND:
          aircraftSearchType === 'icao'
            ? [
                {
                  iata: {
                    in: airlineIds.map(codes => codes.split('/')[0]),
                  },
                },
                {
                  icao: {
                    in: airlineIds.map(codes => codes.split('/')[1]),
                  },
                },
              ]
            : undefined,
      },
    }),
    prisma.aircraft_type.findMany({
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
  ]);
  return {
    airports: keyBy(airports, 'id'),
    airlines: keyBy(
      airlines,
      aircraftSearchType === 'icao'
        ? ({ iata, icao }) => `${iata}/${icao}`
        : 'id',
    ),
    aircraftTypes: groupBy(aircraftTypes, aircraftSearchType),
  };
};
