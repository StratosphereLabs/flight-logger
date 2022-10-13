import { createTRPCReact } from '@trpc/react';
import { TRPCRouter } from '../../app/routes';

export const trpc = createTRPCReact<TRPCRouter>();
