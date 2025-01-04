import { type inferRouterOutputs } from '@trpc/server';

import { prisma } from '../db';
import { createRegistationSchema } from '../schemas';
import { procedure, router } from '../trpc';

export const registrationsRouter = router({
  createRegistration: procedure
    .input(createRegistationSchema)
    .mutation(async ({ input }) => {
      await prisma.registration.create({
        data: {
          username: input.username,
          email: input.email,
          firstName: input.firstName,
          lastName: input.lastName,
          ipv4: input.ipv4,
          userAgent: input.userAgent,
        },
      });
    }),
});

export type RegistrationsRouter = typeof registrationsRouter;

export type RegistrationsRouterOutput = inferRouterOutputs<RegistrationsRouter>;
