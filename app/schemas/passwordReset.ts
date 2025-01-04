import { z } from 'zod';

import {
  PASSWORD_REQUIREMENT_REGEX,
  PASSWORD_REQUIREMENT_STRING,
} from '../constants';

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Required').email('Invalid email'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Required'),
  password: z
    .string()
    .min(1, {
      message: 'Required',
    })
    .regex(PASSWORD_REQUIREMENT_REGEX, {
      message: PASSWORD_REQUIREMENT_STRING,
    }),
  confirmPassword: z
    .string()
    .min(1, {
      message: 'Required',
    })
    .regex(PASSWORD_REQUIREMENT_REGEX, {
      message: PASSWORD_REQUIREMENT_STRING,
    }),
});

export type ForgotPasswordRequest = z.infer<typeof forgotPasswordSchema>;

export type ResetPasswordRequest = z.infer<typeof resetPasswordSchema>;
