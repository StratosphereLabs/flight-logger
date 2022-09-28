import { aircraft_type, airline, airport, flight } from '@prisma/client';
import { parse } from 'csv-parse/sync';
import { zonedTimeToUtc } from 'date-fns-tz';
import createHttpError from 'http-errors';
import groupBy from 'lodash.groupby';
import keyBy from 'lodash.keyby';
import { findBestMatch } from 'string-similarity';
import { DIGIT_REGEX } from '../constants';
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

interface DataFetchResults {
  airports: Record<string, airport>;
  airlines: Record<string, airline>;
  aircraftTypes: Record<string, aircraft_type[]>;
}

export const AIRPORT_ID_REGEX = /\([A-Z]{3}\/[A-Z]{4}\)/g;
export const AIRLINE_ID_REGEX = /\([A-Z0-9]{2}\/[A-Z]{3}\)/g;
export const AIRCRAFT_TYPE_ICAO_REGEX = /\([A-Z0-9]{3,4}\)/g;

export const getUTCTime = (
  date: string,
  time: string,
  timeZone: string,
): string => zonedTimeToUtc(`${date} ${time}`, timeZone).toISOString();

export const getAirportId = (text: string): string | null => {
  const match = text.match(AIRPORT_ID_REGEX);
  if (match === null) {
    return null;
  }
  return match[0].split('/')[1].split(')')[0];
};

export const getAirlineId = (text: string): string | null => {
  const match = text.match(AIRLINE_ID_REGEX);
  if (match === null) {
    return null;
  }
  return match[0].split('(')[1].split(')')[0];
};

export const getAircraftName = (text: string): string =>
  text.split('(')[0].trim();

export const getAircraftIcao = (text: string): string => {
  const match = text.match(AIRCRAFT_TYPE_ICAO_REGEX);
  return match?.[0].split('(')[1].split(')')[0] ?? '';
};

export const getFlightNumber = (text: string): number | null => {
  const number = Number(text.slice(2).match(DIGIT_REGEX)?.join(''));
  if (isNaN(number)) return null;
  return number;
};

export const fetchData = async (
  rows: FlightDiaryRow[],
): Promise<DataFetchResults> => {
  const airportIds = [
    ...new Set(
      rows.flatMap(row =>
        row.From !== '' && row.To !== '' ? [row.From, row.To] : [],
      ),
    ),
  ];
  const airlineIds = [
    ...new Set(rows.flatMap(row => (row.Airline !== '' ? [row.Airline] : []))),
  ];
  const aircraftTypeIcaos = [
    ...new Set(
      rows.flatMap(row =>
        row.Aircraft !== '' ? [getAircraftIcao(row.Aircraft)] : [],
      ),
    ),
  ];

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
        AND: [
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
  ]);

  return {
    airports: keyBy(airports, 'id'),
    airlines: keyBy(airlines, ({ iata, icao }) => `${iata}/${icao}`),
    aircraftTypes: groupBy(aircraftTypes, 'icao'),
  };
};

export const saveFlightDiaryData = async (
  username: string,
  file?: Express.Multer.File,
): Promise<Array<flight | null>> => {
  if (file === undefined) {
    throw createHttpError(400, 'File not found');
  }
  const csv = file.buffer.toString();
  const parsedRows = parse(csv, {
    columns: true,
    skip_empty_lines: true,
  }) as FlightDiaryRow[];
  const rows: FlightDiaryRow[] = parsedRows.map(row => ({
    ...row,
    From: getAirportId(row.From) ?? '',
    To: getAirportId(row.To) ?? '',
    Airline: getAirlineId(row.Airline) ?? '',
  }));

  const data = await fetchData(rows);

  return await prisma.$transaction(
    rows.flatMap(row => {
      const departureAirport = data.airports[row.From];
      const arrivalAirport = data.airports[row.To];
      if (departureAirport === undefined || arrivalAirport === undefined)
        return [];
      const airline = data.airlines[row.Airline];
      const aircraftIcao = getAircraftIcao(row.Aircraft);
      const aircraftName = getAircraftName(row.Aircraft);
      const aircraftTypes = data.aircraftTypes[aircraftIcao];
      const { bestMatchIndex } = findBestMatch(
        aircraftName,
        aircraftTypes?.map(({ name }) => name) ?? [''],
      );
      return [
        prisma.flight.create({
          data: {
            user: {
              connect: {
                username,
              },
            },
            departureAirport: {
              connect: {
                id: departureAirport.id,
              },
            },
            arrivalAirport: {
              connect: {
                id: arrivalAirport.id,
              },
            },
            airline:
              airline !== undefined
                ? {
                    connect: {
                      id: airline.id,
                    },
                  }
                : undefined,
            aircraftType:
              aircraftTypes !== undefined
                ? {
                    connect: {
                      id: aircraftTypes[bestMatchIndex].id,
                    },
                  }
                : undefined,
            flightNumber: getFlightNumber(row['Flight number']),
            tailNumber: row.Registration,
            outTime: getUTCTime(
              row.Date,
              row['Dep time'],
              departureAirport.timeZone,
            ),
            inTime: getUTCTime(
              row.Date,
              row['Arr time'],
              arrivalAirport.timeZone,
            ),
            seatNumber: row['Seat number'],
            comments: row.Note,
          },
        }),
      ];
    }),
  );
};
