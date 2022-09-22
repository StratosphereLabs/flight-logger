import { aircraft_type, airline, airport } from '@prisma/client';
import { parse } from 'csv-parse/sync';
import createHttpError from 'http-errors';
import { prisma } from '../db';

interface FlightDiaryRow {
  Date: string;
  'Flight number': string;
  From: string;
  To: string;
  'Dep time': string;
  'Arr time': string;
  Duration: string;
  Airline: string;
  Aircraft: string;
  Registration: string;
  'Seat number': string;
  'Seat type': string;
  'Flight class': string;
  'Flight reason': string;
  Note: string;
  Dep_id: string;
  Arr_id: string;
  Airline_id: string;
  Aircraft_id: string;
}

export const parseAirport = (text: string): string | null => {
  const regex = /\([A-Z]{3}\/[A-Z]{4}\)/g;
  const match = text.match(regex);
  if (match === null) {
    return null;
  }
  const icao = match[0].split('/')[1].split(')')[0];
  return icao;
};

export const parseAirline = (text: string): string | null => {
  const regex = /\([A-Z0-9]{2}\/[A-Z]{3}\)/g;
  const match = text.match(regex);
  if (match === null) {
    return null;
  }
  const codes = match[0].split('(')[1].split(')')[0];
  const [iata, icao] = codes.split('/');
  return `${iata}_${icao}`;
};

export const parseAircraft = (text: string): string | null => {
  const regex = /\([A-Z0-9]{3,4}\)/g;
  const match = text.match(regex);
  if (match === null) {
    return null;
  }
  const icao = match[0].split('(')[1].split(')')[0];
  return icao;
};

export const saveFlightDiaryData = async (
  userId: number,
  file?: Express.Multer.File,
): Promise<{
  userId: number;
  airports: airport[];
  airlines: airline[];
  aircraftTypes: aircraft_type[];
}> => {
  if (file === undefined) {
    throw createHttpError(400, 'File not found');
  }
  const csv = file.buffer.toString();
  const rows = parse(csv, {
    columns: true,
    skip_empty_lines: true,
  }) as FlightDiaryRow[];

  const airportIds = [
    ...new Set(
      rows.flatMap(row => {
        const departureAirport = parseAirport(row.From);
        const arrivalAirport = parseAirport(row.To);
        return departureAirport !== null && arrivalAirport !== null
          ? [departureAirport, arrivalAirport]
          : [];
      }),
    ),
  ];

  const airlineIds = [
    ...new Set(
      rows.flatMap(row => {
        const airline = parseAirline(row.Airline);
        return airline !== null ? [airline] : [];
      }),
    ),
  ];

  const aircraftTypeIcaos = [
    ...new Set(
      rows.flatMap(row => {
        const aircraftType = parseAircraft(row.Aircraft);
        return aircraftType !== null ? [aircraftType] : [];
      }),
    ),
  ];

  const dataPromises: [
    Promise<airport[]>,
    Promise<airline[]>,
    Promise<aircraft_type[]>,
  ] = [
    prisma.airport.findMany({
      where: {
        id: {
          in: airportIds,
        },
      },
    }),
    prisma.airline.findMany({
      where: {
        AND: [
          {
            iata: {
              in: airlineIds.map(codes => codes.split('_')[0]),
            },
          },
          {
            icao: {
              in: airlineIds.map(codes => codes.split('_')[1]),
            },
          },
        ],
      },
    }),
    prisma.aircraft_type.findMany({
      where: {
        icao: {
          in: aircraftTypeIcaos,
        },
      },
    }),
  ];

  const results = await Promise.all(dataPromises);

  return {
    userId,
    airports: results[0],
    airlines: results[1],
    aircraftTypes: results[2],
  };
};
