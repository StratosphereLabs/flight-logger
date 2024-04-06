import { TRPCError } from '@trpc/server';
import { isAfter } from 'date-fns';
import { prisma } from '../db';
import { verifyAuthenticated } from '../middleware';
import { createNotificationSchema, deleteNotificationSchema } from '../schemas';
import { procedure, router } from '../trpc';

export const notificationsRouter = router({
  getNotifications: procedure
    .use(verifyAuthenticated)
    .query(async ({ ctx }) => {
      const notifications = await prisma.notification.findMany({
        where: {
          userId: ctx.user.id,
        },
      });
      await prisma.$transaction(
        notifications.flatMap(notification =>
          notification.expiration !== null &&
          isAfter(new Date(), notification.expiration)
            ? prisma.notification.delete({
                where: {
                  id: notification.id,
                },
              })
            : [],
        ),
      );
      return await prisma.notification.findMany({
        where: {
          userId: ctx.user.id,
        },
      });
    }),
  createNotification: procedure
    .use(verifyAuthenticated)
    .input(createNotificationSchema)
    .mutation(async ({ input, ctx }) => {
      const notification = await prisma.notification.create({
        data: {
          userId: ctx.user.id,
          ...input,
        },
      });
      return notification;
    }),
  deleteNotification: procedure
    .use(verifyAuthenticated)
    .input(deleteNotificationSchema)
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      const notification = await prisma.notification.findFirst({
        where: {
          id,
          userId: ctx.user.id,
        },
      });
      if (notification === null) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Notification not found.',
        });
      }
      return await prisma.notification.delete({
        where: {
          id,
        },
      });
    }),
});
