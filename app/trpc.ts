import { initTRPC } from '@trpc/server';
import { Context } from './context';
import { verifyAdmin, verifyAuthenticated } from './middleware';

const t = initTRPC.context<Context>().create();

// We explicitly export the methods we use here
// This allows us to create reusable & protected base procedures
export const middleware = t.middleware;
export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(verifyAuthenticated);
export const adminProcedure = t.procedure.use(verifyAdmin);
