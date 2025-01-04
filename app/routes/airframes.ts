import { type inferRouterOutputs } from '@trpc/server';

import { prisma } from '../db';
import { searchSchema } from '../schemas';
import { procedure, router } from '../trpc';

export const airframesRouter = router({
  searchAirframes: procedure.input(searchSchema).query(async ({ input }) => {
    const { query } = input;
    const airframes = await prisma.airframe.findMany({
      take: 5,
      where: {
        OR: [
          {
            registration: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            icao24: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
      },
      include: {
        operator: true,
        aircraftType: true,
      },
      orderBy: {
        operatorId: 'asc',
      },
    });
    return airframes.map(airframe => ({
      type: 'existing',
      id: airframe.icao24,
      ...airframe,
    }));
  }),
});

export type AirframesRouter = typeof airframesRouter;

export type AirframesRouterOutput = inferRouterOutputs<AirframesRouter>;
