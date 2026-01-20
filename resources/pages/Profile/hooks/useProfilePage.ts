import { useLocation, useParams } from '@tanstack/react-router';
import { useMemo } from 'react';

import { getIsLoggedIn, useAuthStore } from '../../../stores';

export interface UseProfilePageResult {
  isProfilePage: boolean;
  isAuthorized: boolean;
}

export const useProfilePage = (): UseProfilePageResult => {
  const { pathname } = useLocation();
  const { username } = useParams({
    from: '/pathlessMainLayout/pathlessProfileLayout/user/$username',
  });
  const isLoggedIn = useAuthStore(getIsLoggedIn);
  const isProfilePage = useMemo(
    () => pathname.includes('/profile') || pathname.includes('/user/'),
    [pathname],
  );
  const isAuthorized = useMemo(
    () => isLoggedIn || username !== undefined,
    [isLoggedIn, username],
  );
  return { isProfilePage, isAuthorized };
};
