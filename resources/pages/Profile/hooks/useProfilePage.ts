import { useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { getIsLoggedIn, useAuthStore } from '../../../stores';

export interface UseProfilePageResult {
  isProfilePage: boolean;
  isAuthorized: boolean;
}

export const useProfilePage = (): UseProfilePageResult => {
  const { pathname } = useLocation();
  const { username } = useParams();
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
