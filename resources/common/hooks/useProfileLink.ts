import { useParams } from 'react-router-dom';
import { APP_URL } from '../constants';
import { trpc } from '../../utils/trpc';

export const useProfileLink = (path: string): string => {
  const { username } = useParams();
  const utils = trpc.useContext();
  const currentUser = utils.users.getUser.getData({ username: undefined });
  const currentUsername = username ?? currentUser?.username;
  const profilePath =
    currentUsername !== undefined ? `/user/${currentUsername}/${path}` : '';
  return `${APP_URL}${profilePath}`;
};
