import { useParams } from '@tanstack/react-router';
import { type TRPCClientErrorLike } from '@trpc/client';
import { type UseTRPCQueryResult } from '@trpc/react-query/shared';

import {
  type UsersRouter,
  type UsersRouterOutput,
} from '../../../app/routes/users';
import { trpc } from '../../utils/trpc';
import { useProfilePage } from './useProfilePage';
import { useTRPCErrorHandler } from './useTRPCErrorHandler';

export const useProfileUserQuery = (): UseTRPCQueryResult<
  UsersRouterOutput['getUser'],
  TRPCClientErrorLike<UsersRouter>
> => {
  const enabled = useProfilePage();
  const { username } = useParams({
    from: '/pathlessMainLayout/pathlessProfileLayout/user/$username',
  });
  const onError = useTRPCErrorHandler();
  return trpc.users.getUser.useQuery(
    {
      username,
    },
    {
      enabled,
      staleTime: 5 * 60 * 1000,
      onError,
    },
  );
};
