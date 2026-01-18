import { useParams } from '@tanstack/react-router';

import { getIsLoggedIn, useAuthStore } from '../../stores';

export const useProfilePage = (): boolean => {
  const isLoggedIn = useAuthStore(getIsLoggedIn);
  const { username } = useParams({
    from: '/pathlessProfileLayout/user/$username',
  });
  return username !== undefined || isLoggedIn;
};
