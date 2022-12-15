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
