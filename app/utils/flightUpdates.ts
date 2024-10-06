import type { FlightUpdateChange } from '@prisma/client';
import { isAfter } from 'date-fns';
import {
  CHANGE_FIELD_ESTIMATED_TEXT_MAP,
  CHANGE_FIELD_TEXT_MAP,
} from '../constants';
import { prisma } from '../db';

export type FlightUpdateChangeWithData = Awaited<
  ReturnType<typeof getFlightUpdateChangeWithData>
>;

export const getFlightUpdateChangeWithData = async (
  change: FlightUpdateChange,
  createdAt: Date,
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
) => {
  switch (change.field) {
    case 'AIRCRAFT_TYPE': {
      const oldAircraft =
        change.oldValue !== null
          ? await prisma.aircraftType.findUnique({
              where: {
                id: change.oldValue,
              },
              cacheStrategy: {
                ttl: 30 * 24 * 60 * 60,
              },
            })
          : null;
      const newAircraft =
        change.newValue !== null
          ? await prisma.aircraftType.findUnique({
              where: {
                id: change.newValue,
              },
              cacheStrategy: {
                ttl: 30 * 24 * 60 * 60,
              },
            })
          : null;
      return {
        ...change,
        fieldText: CHANGE_FIELD_TEXT_MAP[change.field],
        oldValue: oldAircraft,
        newValue: newAircraft,
      };
    }
    case 'ARRIVAL_AIRPORT':
    case 'DEPARTURE_AIRPORT':
    case 'DIVERSION_AIRPORT': {
      const oldAirport =
        change.oldValue !== null
          ? await prisma.airport.findUnique({
              where: {
                id: change.oldValue,
              },
              cacheStrategy: {
                ttl: 30 * 24 * 60 * 60,
              },
            })
          : null;
      const newAirport =
        change.newValue !== null
          ? await prisma.airport.findUnique({
              where: {
                id: change.newValue,
              },
              cacheStrategy: {
                ttl: 30 * 24 * 60 * 60,
              },
            })
          : null;
      return {
        ...change,
        fieldText: CHANGE_FIELD_TEXT_MAP[change.field],
        oldValue: oldAirport,
        newValue: newAirport,
      };
    }
    case 'AIRLINE':
    case 'OPERATOR_AIRLINE': {
      const oldAirline =
        change.oldValue !== null
          ? await prisma.airline.findUnique({
              where: {
                id: change.oldValue,
              },
              cacheStrategy: {
                ttl: 30 * 24 * 60 * 60,
              },
            })
          : null;
      const newAirline =
        change.newValue !== null
          ? await prisma.airline.findUnique({
              where: {
                id: change.newValue,
              },
              cacheStrategy: {
                ttl: 30 * 24 * 60 * 60,
              },
            })
          : null;
      return {
        ...change,
        fieldText: CHANGE_FIELD_TEXT_MAP[change.field],
        oldValue: oldAirline,
        newValue: newAirline,
      };
    }
    case 'IN_TIME_ACTUAL':
    case 'ON_TIME_ACTUAL':
    case 'OFF_TIME_ACTUAL':
    case 'OUT_TIME_ACTUAL': {
      const timeValue = change.newValue ?? change.oldValue;
      return {
        ...change,
        fieldText:
          timeValue !== null
            ? isAfter(createdAt, new Date(timeValue))
              ? CHANGE_FIELD_TEXT_MAP[change.field]
              : CHANGE_FIELD_ESTIMATED_TEXT_MAP[change.field]
            : null,
      };
    }
    default:
      return {
        ...change,
        fieldText: CHANGE_FIELD_TEXT_MAP[change.field],
      };
  }
};
