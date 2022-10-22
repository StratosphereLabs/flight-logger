import { TRPCError } from '@trpc/server';
import bcrypt from 'bcryptjs';
import { prisma } from '../db';
import { loginSchema, registerSchema } from '../schemas';
import { procedure, router } from '../trpc';
import { generateUserToken, upsertUser } from '../utils';

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
  }),
  register: procedure.input(registerSchema).mutation(async ({ input }) => {
    const token = await upsertUser(input);
    return { token };
  }),
});
