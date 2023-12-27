import { TRPCError } from '@trpc/server';
import bcrypt from 'bcryptjs';
import { prisma, upsertUser } from '../db';
import { loginSchema, registerSchema } from '../schemas';
import { procedure, router } from '../trpc';
import { generateUserToken } from '../utils';

export const authRouter = router({
  login: procedure.input(loginSchema).mutation(async ({ input }) => {
    const { email, password } = input;
    const user = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });
    if (user === null) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message:
          'No user with that email address found. Please create a new account.',
      });
    }
    if (user.password === null) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message:
          'No password stored. Please reset your password to create a new one.',
      });
    }
    if (!bcrypt.compareSync(password, user.password)) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Incorrect password.',
      });
    }
    const token = generateUserToken(user);
    if (token === null) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Missing JWT secret.',
      });
    }
    return { token };
  }),
  register: procedure.input(registerSchema).mutation(async ({ input }) => {
    const { confirmPassword, password } = input;
    if (confirmPassword !== password) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Passwords do not match',
      });
    }
    const token = await upsertUser(input);
    if (token === null) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Missing JWT secret.',
      });
    }
    return { token };
  }),
});
