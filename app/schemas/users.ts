import { z } from 'zod';

export const getUserSchema = z.object({
  username: z.string().trim().optional(),
});

export const getUsersSchema = z.object({
  query: z.string(),
  followingUsersOnly: z.boolean().optional(),
});

export const selectUserSchema = z.object({
  username: z
    .string()
    .nullable()
    .refine(item => item !== null, 'User is required.'),
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

export type GetUserRequest = z.infer<typeof getUserSchema>;

export type UserSelectFormData = z.infer<typeof selectUserSchema>;
