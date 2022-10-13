import { TRPCError } from '@trpc/server';
import bcrypt from 'bcryptjs';
import { prisma } from '../db';
import { loginSchema, registerSchema } from '../schemas';
import { publicProcedure, router } from '../trpc';
import { generateUserToken, upsertUser } from '../utils';

export const authRouter = router({
  login: publicProcedure.input(loginSchema).mutation(async ({ input }) => {
    const { email, password } = input;
    try {
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
      const matching = await bcrypt.compare(password, user.password);
      if (!matching) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Incorrect password.',
        });
      }
      return {
        token: generateUserToken(user),
      };
    } catch (err) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred, please try again later.',
        cause: err,
      });
    }
  }),
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ input }) => {
      try {
        return await upsertUser(input);
      } catch (err) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred, please try again later.',
          cause: err,
        });
      }
    }),
});
