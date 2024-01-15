import { parse } from 'csv-parse/sync';
import createHttpError from 'http-errors';

export interface CSVRow {
  date: string;
  airline_id: string;
  flight_number: string;
  aircraft_type_icao: string;
  registration: string;
  dep_iata: string;
  arr_iata: string;
  dep_time: string;
  dep_time_actual: string;
  arr_time: string;
  arr_time_actual: string;
}

export const parseCSVFile = (file?: Express.Multer.File): CSVRow[] => {
  if (file === undefined) {
    throw createHttpError(400, 'File not found');
  }
  try {
    const csv = file.buffer.toString();
    const parsedRows = parse(csv, {
      columns: true,
      skip_empty_lines: true,
    }) as CSVRow[];
    return parsedRows;
  } catch (err) {
    throw createHttpError(400, 'Invalid CSV data file.');
  }
};
