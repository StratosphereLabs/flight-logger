import { parse } from 'csv-parse/sync';
import createHttpError from 'http-errors';
import { DIGIT_REGEX } from '../constants';

export const AIRPORT_ID_REGEX = /\([A-Z]{3}\/[A-Z]{4}\)/g;
export const AIRLINE_ID_REGEX = /\([A-Z0-9]{2}\/[A-Z]{3}\)/g;
export const AIRCRAFT_TYPE_ICAO_REGEX = /\([A-Z0-9]{3,4}\)/g;

export const getAirportId = (text: string): string | null => {
  const match = text.match(AIRPORT_ID_REGEX);
  if (match === null) {
    return null;
  }
  return match[0].split('/')[1].split(')')[0];
};

export const getAirlineIcao = (text: string): string | null => {
  const match = text.match(AIRLINE_ID_REGEX);
  if (match === null) {
    return null;
  }
  return match[0].split('(')[1].split(')')[0].split('/')[1];
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

export interface FlightDiaryRow {
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

export const parseFlightDiaryFile = (
  file?: Express.Multer.File,
): FlightDiaryRow[] => {
  if (file === undefined) {
    throw createHttpError(400, 'File not found');
  }
  try {
    const csv = file.buffer.toString();
    const parsedRows = parse(csv, {
      columns: true,
      skip_empty_lines: true,
    }) as FlightDiaryRow[];
    return parsedRows.map(row => ({
      ...row,
      From: getAirportId(row.From) ?? '',
      To: getAirportId(row.To) ?? '',
      Airline: getAirlineIcao(row.Airline) ?? '',
    }));
  } catch (err) {
    throw createHttpError(400, 'Invalid myFlightradar24 data file.');
  }
};
