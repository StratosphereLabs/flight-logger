import { z } from 'zod';
import { registerSchema } from './auth';

export const createRegistationSchema = registerSchema.extend({
  ipv4: z.string().ip(),
  userAgent: z.string(),
});
