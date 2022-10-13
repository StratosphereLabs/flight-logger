import { TRPCError } from '@trpc/server';
import { middleware } from '../../trpc';

export const verifyAuthenticated = middleware(async ({ ctx, next }) => {
  if (ctx.user === undefined) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return await next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const verifyAdmin = middleware(async ({ ctx, next }) => {
  if (ctx.user?.admin !== true) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return await next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});
