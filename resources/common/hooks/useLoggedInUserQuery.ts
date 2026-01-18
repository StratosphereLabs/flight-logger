import { useParams } from '@tanstack/react-router';
import { type TRPCClientErrorLike } from '@trpc/client';
import { type UseTRPCQueryResult } from '@trpc/react-query/shared';
import { useMemo } from 'react';

import {
  type UsersRouter,
  type UsersRouterOutput,
} from '../../../app/routes/users';
import { getIsLoggedIn, useAuthStore } from '../../stores';
import { trpc } from '../../utils/trpc';
import { useTRPCErrorHandler } from './useTRPCErrorHandler';

export const useLoggedInUserQuery = (
  onSuccess?: (data: UsersRouterOutput['getUser']) => Promise<void> | void,
): UseTRPCQueryResult<
  UsersRouterOutput['getUser'],
  TRPCClientErrorLike<UsersRouter>
> & {
  onOwnProfile: boolean;
} => {
  const enabled = useAuthStore(getIsLoggedIn);
  const { username } = useParams({
    from: '/pathlessProfileLayout/user/$username',
  });
  const onError = useTRPCErrorHandler();
  const result = trpc.users.getUser.useQuery(
    { username: undefined },
    {
      enabled,
      staleTime: 5 * 60 * 1000,
      onSuccess,
      onError,
    },
  );
  const onOwnProfile = useMemo(
    () => username === undefined || username === result.data?.username,
    [result.data?.username, username],
  );
  return {
    ...result,
    onOwnProfile,
  };
};
