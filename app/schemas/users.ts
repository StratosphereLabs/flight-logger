import { z } from 'zod';
import { paginationSchema } from './pagination';

export const getUserSchema = z.object({
  username: z.string().min(1, 'Username required'),
});

export const getUsersSchema = paginationSchema.extend({
  username: z.string().min(1, 'Username required'),
});

export type GetUserRequest = z.infer<typeof getUserSchema>;

export type GetUsersRequest = z.infer<typeof getUsersSchema>;
