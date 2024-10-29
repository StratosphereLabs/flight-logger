import { PrismaClient } from '@prisma/client';
// import { withAccelerate } from '@prisma/extension-accelerate';

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
});
// .$extends(withAccelerate());
