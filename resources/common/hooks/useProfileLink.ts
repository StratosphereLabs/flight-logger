import { useParams } from 'react-router-dom';
import { APP_URL } from '../constants';

export const useProfileLink = (path: string): string => {
  const { username } = useParams();
  const profilePath =
    username !== undefined ? `/user/${username}/${path}` : `/${path}`;
  return `${APP_URL}${profilePath}`;
};
