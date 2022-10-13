import { TRPCError } from '@trpc/server';
import bcrypt from 'bcryptjs';
import { prisma } from '../db';
import { forgotPasswordSchema, resetPasswordSchema } from '../schemas';
import { publicProcedure, router } from '../trpc';
import { getPasswordResetToken, getResetEmail, sendEmail } from '../utils';

export const passwordResetRouter = router({
  forgotPassword: publicProcedure
    .input(forgotPasswordSchema)
    .mutation(async ({ ctx, input }) => {
      const { email } = input;
      try {
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
      } catch (err) {
        await prisma.user.update({
          where: {
            email,
          },
          data: {
            passwordResetAt: null,
            passwordResetToken: null,
          },
        });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred, please try again later.',
          cause: err,
        });
      }
    }),
  resetPassword: publicProcedure
    .input(resetPasswordSchema)
    .mutation(async ({ input }) => {
      const { password, token } = input;
      try {
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
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            password: hashedPassword,
            passwordResetToken: null,
            passwordResetAt: null,
          },
        });
      } catch (err) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred, please try again later.',
          cause: err,
        });
      }
    }),
});
