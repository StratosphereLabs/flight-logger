import { initTRPC } from '@trpc/server';
import { ZodError } from 'zod';

import { type Context } from './context';

const t = initTRPC.context<Context>().create({
  errorFormatter: ({ shape, error }) => ({
    ...shape,
    data: {
      ...shape.data,
      zodError:
        error.code === 'BAD_REQUEST' && error.cause instanceof ZodError
          ? error.cause.flatten()
          : null,
    },
  }),
});

export const middleware = t.middleware;
export const router = t.router;
export const procedure = t.procedure;
