import { z } from 'zod';

export const getUserSchema = z.object({
  username: z.string().optional(),
});

export type GetUserRequest = z.infer<typeof getUserSchema>;
