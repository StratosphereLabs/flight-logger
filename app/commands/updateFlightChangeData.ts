import type { flight, flight_update_change } from '@prisma/client';
import { Promise } from 'bluebird';
import { prisma } from '../db';
import { DB_PROMISE_CONCURRENCY } from '../db/seeders/constants';
import { FLIGHT_CHANGE_GETTER_MAP } from './constants';
import { getIsEqual } from './utils';

export const updateFlightChangeData = async (
  flights: flight[],
  updatedData: Partial<flight>,
  userId?: number,
): Promise<void> => {
  const departureAirportId =
    updatedData.departureAirportId ?? flights[0].departureAirportId;
  const arrivalAirportId =
    updatedData.arrivalAirportId ?? flights[0].arrivalAirportId;
  const flightUpdates: Record<
    string,
    Array<Omit<flight_update_change, 'id' | 'updateId'>>
  > = {};
  for (const flight of flights) {
    for (const [key, value] of Object.entries(updatedData)) {
      if (!getIsEqual(flight[key as keyof flight], value)) {
        const getUpdate = FLIGHT_CHANGE_GETTER_MAP[key as keyof flight];
        if (getUpdate !== undefined) {
          if (flightUpdates[flight.id] === undefined) {
            flightUpdates[flight.id] = [];
          }
          flightUpdates[flight.id].push(getUpdate(flight, updatedData));
        }
      }
    }
  }
  await Promise.map(
    Object.entries(flightUpdates),
    async ([flightId, updates]) => {
      const flightUpdate = await prisma.flight_update.create({
        data: {
          flightId,
          changedByUserId: userId ?? null,
          departureAirportId,
          arrivalAirportId,
        },
      });
      await prisma.flight_update_change.createMany({
        data: updates.map(update => ({
          updateId: flightUpdate.id,
          ...update,
        })),
      });
    },
    {
      concurrency: DB_PROMISE_CONCURRENCY,
    },
  );
};
