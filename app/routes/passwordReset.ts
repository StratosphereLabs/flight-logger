import { TRPCError } from '@trpc/server';
import bcrypt from 'bcryptjs';
import { prisma } from '../db';
import { forgotPasswordSchema, resetPasswordSchema } from '../schemas';
import { procedure, router } from '../trpc';
import { getPasswordResetToken, getResetEmail, sendEmail } from '../utils';

export const passwordResetRouter = router({
  forgotPassword: procedure
    .input(forgotPasswordSchema)
    .mutation(async ({ ctx, input }) => {
      const { email } = input;
      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      });
      if (user === null) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No user with this email address found',
        });
      }
      const passwordResetToken = getPasswordResetToken();
      await prisma.user.update({
        where: {
          email,
        },
        data: {
          passwordResetToken,
          passwordResetAt: new Date(Date.now() + 10 * 60 * 1000),
        },
      });
      await sendEmail({
        address: email,
        subject: 'Reset your password',
        html: getResetEmail({
          resetLink: `${
            ctx.origin ?? ''
          }/auth/reset-password/${passwordResetToken}`,
        }),
      });
    }),
  resetPassword: procedure
    .input(resetPasswordSchema)
    .mutation(async ({ input }) => {
      const { confirmPassword, password, token } = input;
      if (confirmPassword !== password) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Passwords do not match',
        });
      }
      const user = await prisma.user.findFirst({
        where: {
          passwordResetToken: token,
          passwordResetAt: {
            gt: new Date(),
          },
        },
      });
      if (user === null) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found.',
        });
      }
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          password: bcrypt.hashSync(password, 10),
          passwordResetToken: null,
          passwordResetAt: null,
        },
      });
    }),
});
