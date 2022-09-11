import {
  FlightClass,
  FlightReason,
  Prisma,
  SeatPosition,
} from '@prisma/client';
import { m } from 'vitest/dist/index-ea17aa0c';

export const flightsData: Prisma.Enumerable<Prisma.flightCreateManyInput> = [
  {
    userId: 1,
    departureAirportId: 'KPDX',
    arrivalAirportId: 'KOAK',
    airlineId: 'WN_SWA_Southwest_Airlines',
    operatorAirlineId: 'WN_SWA_Southwest_Airlines',
    flightNumber: 2052,
    callsign: 'SWA2052',
    aircraftTypeId: '7M8_B38M',
    outTime: '2022-11-02 13:20:00',
    inTime: '2022-11-02 15:05:00',
    class: FlightClass.ECONOMY,
    seatPosition: SeatPosition.WINDOW,
    reason: FlightReason.BUSINESS,
  },
  {
    userId: 1,
    departureAirportId: 'KOAK',
    arrivalAirportId: 'KLAS',
    airlineId: 'WN_SWA_Southwest_Airlines',
    flightNumber: 1458,
    callsign: 'SWA1458',
    aircraftTypeId: '73W_B737',
    outTime: '2022-11-03 04:20:00',
    inTime: '2022-11-03 05:50:00',
    class: FlightClass.ECONOMY,
    seatPosition: SeatPosition.WINDOW,
    reason: FlightReason.BUSINESS,
  },
];
