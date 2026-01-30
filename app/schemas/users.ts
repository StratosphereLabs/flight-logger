import { z } from 'zod';

import { paginationSchema } from './pagination';

export const getUserSchema = z.object({
  username: z.string().trim().optional(),
});

export const getUsersSchema = z.object({
  query: z.string(),
  followingUsersOnly: z.boolean().optional(),
  max: z.number().int().optional(),
  withoutFlightId: z.string().uuid().optional(),
});

export const selectUserSchema = z
  .object({
    userType: z.enum(['me', 'other']),
    username: z.string().nullable(),
  })
  .superRefine((values, ctx) => {
    if (
      values.userType === 'other' &&
      (values.username === null || values.username === '')
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Required',
        path: ['username'],
      });
    }
  });

export const setFCMTokenSchema = z.object({
  token: z.string(),
});

export const togglePushNotificationsSchema = z.object({
  enabled: z.boolean(),
});

export const addFollowerSchema = z.object({
  username: z.string().trim(),
});

export const getFollowingAndFollowersSchema = paginationSchema
  .extend(getUserSchema.shape)
  .extend({
    type: z.enum(['following', 'followers']).nullable(),
  });

export type GetUserRequest = z.infer<typeof getUserSchema>;

export type UserSelectFormData = z.infer<typeof selectUserSchema>;
