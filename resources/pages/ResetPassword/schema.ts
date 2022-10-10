import { z } from 'zod';
import {
  PASSWORD_REQUIREMENT_REGEX,
  PASSWORD_REQUIREMENT_STRING,
} from '../../common/constants';

export const resetPasswordSchema = z.object({
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