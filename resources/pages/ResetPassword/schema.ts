import { z } from 'zod';

export const PASSWORD_REQUIREMENT_REGEX =
  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,255}$/;
export const PASSWORD_REQUIREMENT_STRING =
  'Password must be at least 8 characters and must include at least one upper case letter, one lower case letter, and one numeric digit.';

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
