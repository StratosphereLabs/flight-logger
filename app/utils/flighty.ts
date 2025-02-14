import { parse } from 'csv-parse/sync';
import { fromZonedTime } from 'date-fns-tz';
import createHttpError from 'http-errors';

interface FlightyRow {
  Date: string;
  Airline: string;
  Flight: string;
  From: string;
  To: string;
  'Dep Terminal': string;
  'Dep Gate': string;
  'Arr Terminal': string;
  'Arr Gate': string;
  Canceled: string;
  'Diverted To': string;
  'Gate Departure (Scheduled)': string;
  'Gate Departure (Actual)': string;
  'Take off (Scheduled)': string;
  'Take off (Actual)': string;
  'Landing (Scheduled)': string;
  'Landing (Actual)': string;
  'Gate Arrival (Scheduled)': string;
  'Gate Arrival (Actual)': string;
  'Aircraft Type Name': string;
  'Tail Number': string;
  PNR: string;
  Seat: string;
  'Seat Type': string;
  'Cabin Class': string;
  'Flight Reason': string;
  Notes: string;
}

export const parseFlightyDateTime = (
  dateString: string,
  timeZone: string,
): Date | null => {
  const [date, time] = dateString.split(' ');
  return date !== '' && time !== '' && time !== undefined
    ? fromZonedTime(new Date(`${date} ${time}`), timeZone)
    : null;
};

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
