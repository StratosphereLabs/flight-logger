import { useParams } from 'react-router-dom';
import { useAuthStore } from '../../stores';

export const useProfilePage = (): boolean => {
  const isLoggedIn = useAuthStore(({ token }) => token !== null);
  const { username } = useParams();
  return username !== undefined || isLoggedIn;
};
