import { z } from 'zod';
import {
  PASSWORD_REQUIREMENT_REGEX,
  PASSWORD_REQUIREMENT_STRING,
} from '../../common/constants';

export const registerSchema = z.object({
  username: z.string().min(1, {
    message: 'Required',
  }),
  email: z
    .string()
    .min(1, {
      message: 'Required',
    })
    .email({ message: 'Invalid email address' }),
  firstName: z.string(),
  lastName: z.string(),
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
