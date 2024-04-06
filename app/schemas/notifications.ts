import { z } from 'zod';
import { notificationSchema } from '../../prisma/generated/zod';

export const createNotificationSchema = notificationSchema.omit({
  id: true,
  userId: true,
});

export const deleteNotificationSchema = z.object({
  id: z.string().uuid(),
});
