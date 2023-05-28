import { TRPCError, inferRouterOutputs } from '@trpc/server';
import { prisma } from '../db';
import { getAirframeSchema, searchSchema } from '../schemas';
import { procedure, router } from '../trpc';

export const airframesRouter = router({
  getAirframe: procedure.input(getAirframeSchema).query(async ({ input }) => {
    const { icao24, registration } = input;
    const airframe = await prisma.airframe.findFirst({
      where: {
        icao24,
        registration,
      },
    });
    if (airframe === null) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Airframe not found.',
      });
    }
    return airframe;
  }),
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
      },
      orderBy: {
        operatorId: 'asc',
      },
    });
    return airframes.map(airframe => ({
      id: airframe.icao24,
      ...airframe,
    }));
  }),
});

export type AirframesRouter = typeof airframesRouter;

export type AirframesRouterOutput = inferRouterOutputs<AirframesRouter>;
