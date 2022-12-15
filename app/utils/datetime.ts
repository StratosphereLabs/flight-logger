import { airport } from '@prisma/client';
import { zonedTimeToUtc } from 'date-fns-tz';

export interface FlightTimestampsInput {
  departureAirport: airport;
  arrivalAirport: airport;
  outDate: string;
  outTime: string;
  offTime: string | null;
  onTime: string | null;
  inTime: string;
}

export interface FlightTimestampsResult {
  duration: number;
  outTime: string;
  offTime: string | null;
  onTime: string | null;
  inTime: string;
}

export const getFlightTimestamps = ({
  departureAirport,
  arrivalAirport,
  outTime,
  offTime,
  onTime,
  inTime,
}: FlightTimestampsInput): FlightTimestampsResult => {
  console.log({
    departureAirport,
    arrivalAirport,
    outTime,
    offTime,
    onTime,
    inTime,
  });
  return {
    duration: 115,
    outTime: '2022-11-05 11:55:05',
    offTime: null,
    onTime: null,
    inTime: '2022-11-05 13:50:05',
  };
};

export const getUTCTime = (
  date: string,
  time: string,
  timeZone: string,
): string => zonedTimeToUtc(`${date} ${time}`, timeZone).toISOString();
