import { createTRPCReact } from '@trpc/react-query';
import { TRPCRouter } from '../../app/routes';

export const trpc = createTRPCReact<TRPCRouter>();
