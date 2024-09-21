/* eslint-disable @typescript-eslint/non-nullable-type-assertion-style */
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';
import { withPulse } from '@prisma/extension-pulse';

export const prisma = new PrismaClient({
  omit: {
    user: {
      id: true,
      admin: true,
      pushNotifications: true,
      password: true,
      passwordResetAt: true,
      passwordResetToken: true,
    },
    flight: {
      tracklog: true,
      waypoints: true,
    },
  },
})
  .$extends(
    withPulse({
      apiKey: process.env.PULSE_API_KEY as string,
    }),
  )
  .$extends(withAccelerate());
