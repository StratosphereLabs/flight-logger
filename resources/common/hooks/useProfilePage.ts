import { useParams } from 'react-router-dom';
import { getIsLoggedIn, useAuthStore } from '../../stores';

export const useProfilePage = (): boolean => {
  const isLoggedIn = useAuthStore(getIsLoggedIn);
  const { username } = useParams();
  return username !== undefined || isLoggedIn;
};
