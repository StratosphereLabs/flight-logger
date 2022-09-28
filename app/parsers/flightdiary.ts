import { aircraft_type, airline, airport, flight } from '@prisma/client';
import { parse } from 'csv-parse/sync';
import { zonedTimeToUtc } from 'date-fns-tz';
import createHttpError from 'http-errors';
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
  airports: Record<string, airport | undefined>;
  airlines: Record<string, airline | undefined>;
  aircraftTypes: Record<string, aircraft_type | undefined>;
}

export const getUTCTime = (
  date: string,
  time: string,
  timeZone: string,
): string => zonedTimeToUtc(`${date} ${time}`, timeZone).toISOString();

export const getAirportId = (text: string): string | null => {
  const regex = /\([A-Z]{3}\/[A-Z]{4}\)/g;
  const match = text.match(regex);
  if (match === null) {
    return null;
  }
  return match[0].split('/')[1].split(')')[0];
};

export const getAirlineId = (text: string): string | null => {
  const regex = /\([A-Z0-9]{2}\/[A-Z]{3}\)/g;
  const match = text.match(regex);
  if (match === null) {
    return null;
  }
  return match[0].split('(')[1].split(')')[0];
};

export const getAircraftId = (text: string): string | null => {
  const regex = /\([A-Z0-9]{3,4}\)/g;
  const match = text.match(regex);
  if (match === null) {
    return null;
  }
  return match[0].split('(')[1].split(')')[0];
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
  const aircraftTypeIds = [
    ...new Set(
      rows.flatMap(row => (row.Aircraft !== '' ? [row.Aircraft] : [])),
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
          in: aircraftTypeIds,
        },
      },
    }),
  ];

  const [airports, airlines, aircraftTypes] = await Promise.all(dataPromises);

  return {
    airports: airports.reduce(
      (acc, airport) => ({
        ...acc,
        [airport.id]: airport,
      }),
      {},
    ),
    airlines: airlines.reduce(
      (acc, airline) => ({
        ...acc,
        [`${airline.iata}/${airline.icao}`]: airline,
      }),
      {},
    ),
    aircraftTypes: aircraftTypes.reduce(
      (acc, aircraftType) => ({
        ...acc,
        [aircraftType.icao]: aircraftType,
      }),
      {},
    ),
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
    Aircraft: getAircraftId(row.Aircraft) ?? '',
  }));

  const data = await fetchData(rows);

  const promises = rows.flatMap(row => {
    const departureAirport = data.airports[row.From];
    const arrivalAirport = data.airports[row.To];
    const airline = data.airlines[row.Airline];
    const aircraftType = data.aircraftTypes[row.Aircraft];
    if (
      departureAirport === undefined ||
      arrivalAirport === undefined ||
      airline === undefined
    )
      return [];
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
          airline: {
            connect: {
              id: airline.id,
            },
          },
          aircraftType:
            aircraftType !== undefined
              ? {
                  connect: {
                    id: aircraftType.id,
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
  });

  return await Promise.all(promises);
};
