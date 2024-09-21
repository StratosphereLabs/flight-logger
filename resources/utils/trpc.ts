import { createTRPCReact } from '@trpc/react-query';
import { type TRPCRouter } from '../../app/routes';

export const trpc = createTRPCReact<TRPCRouter>();


// 