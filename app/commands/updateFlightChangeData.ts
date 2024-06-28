import type { flight, flight_update_change } from '@prisma/client';
import { prisma } from '../db';
import { FLIGHT_CHANGE_GETTER_MAP } from './constants';
import { getIsEqual } from './utils';

export const updateFlightChangeData = async (
  flights: flight[],
  updatedData: Partial<flight>,
  userId?: number,
): Promise<void> => {
  const flightUpdates: Record<
    string,
    Array<Omit<flight_update_change, 'id' | 'updateId'>>
  > = {};
  for (const flight of flights) {
    for (const [key, value] of Object.entries(updatedData)) {
      if (!getIsEqual(flight[key as keyof flight], value)) {
        if (flightUpdates[flight.id] === undefined) {
          flightUpdates[flight.id] = [];
        }
        const getUpdate = FLIGHT_CHANGE_GETTER_MAP[key as keyof flight];
        if (getUpdate !== undefined) {
          flightUpdates[flight.id].push(getUpdate(flight, updatedData));
        }
      }
    }
  }
  for (const [flightId, updates] of Object.entries(flightUpdates)) {
    const flightUpdate = await prisma.flight_update.create({
      data: {
        flightId,
        changedByUserId: userId ?? null,
      },
    });
    for (const update of updates) {
      await prisma.flight_update_change.create({
        data: {
          updateId: flightUpdate.id,
          ...update,
        },
      });
    }
  }
};
