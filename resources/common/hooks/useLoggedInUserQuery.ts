import { type TRPCClientErrorLike } from '@trpc/client';
import { type UseTRPCQueryResult } from '@trpc/react-query/dist/shared';
import {
  type UsersRouter,
  type UsersRouterOutput,
} from '../../../app/routes/users';
import { getIsLoggedIn, useAuthStore } from '../../stores';
import { trpc } from '../../utils/trpc';

export const useLoggedInUserQuery = (): UseTRPCQueryResult<
  UsersRouterOutput['getUser'],
  TRPCClientErrorLike<UsersRouter>
> => {
  const isLoggedIn = useAuthStore(getIsLoggedIn);
  return trpc.users.getUser.useQuery(
    {
      username: undefined,
    },
    {
      enabled: isLoggedIn,
    },
  );
};
