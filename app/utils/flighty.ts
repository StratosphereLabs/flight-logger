import { parse } from 'csv-parse/sync';
import createHttpError from 'http-errors';

interface FlightyRow {
  'Flight Number': string;
  'Departure Airport': string;
  'Arrival Airport': string;
  'Scheduled Departure Date': string;
  'Actual Departure Date': string;
  'Scheduled Arrival Date': string;
  'Actual Arrival Date': string;
  'Tail Number': string;
  'Flight Type': string;
}

export const parseFlightyFile = (file?: Express.Multer.File): FlightyRow[] => {
  if (file === undefined) {
    throw createHttpError(400, 'File not found');
  }
  try {
    const csv = file.buffer.toString();
    const parsedRows = parse(csv, {
      columns: true,
      skip_empty_lines: true,
    }) as FlightyRow[];
    return parsedRows;
  } catch (err) {
    throw createHttpError(400, 'Invalid Flighty data file.');
  }
};

export const getFlightyFlightNumber = (text: string): number | null => {
  const number = Number(text);
  if (isNaN(number)) return null;
  return number;
};
