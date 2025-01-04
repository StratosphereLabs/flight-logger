import { z } from 'zod';

import {
  PASSWORD_REQUIREMENT_REGEX,
  PASSWORD_REQUIREMENT_STRING,
} from '../constants';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, {
      message: 'Required',
    })
    .email({ message: 'Invalid email address' }),
  password: z.string().min(1, {
    message: 'Required',
  }),
});

export const registerSchema = z.object({
  username: z
    .string()
    .min(1, {
      message: 'Required',
    })
    .trim(),
  email: z
    .string()
    .min(1, {
      message: 'Required',
    })
    .email({ message: 'Invalid email address' }),
  firstName: z.string().trim(),
  lastName: z.string().trim(),
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
