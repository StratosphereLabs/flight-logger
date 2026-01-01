import { useStatsigClient } from '@statsig/react-bindings';
import { useEffect } from 'react';

import { getIsLoggedIn, useAuthStore } from '../../stores';
import { FollowingMap } from './FollowingMap';
import { WelcomeHero } from './WelcomeHero';

export const Home = (): JSX.Element => {
  const { client } = useStatsigClient();
  const isLoggedIn = useAuthStore(getIsLoggedIn);
  useEffect(() => {
    client.logEvent('home_page_viewed');
  }, [client]);
  return isLoggedIn ? (
    <FollowingMap />
  ) : (
    <div className="flex flex-1 flex-col items-center justify-center">
      <WelcomeHero />
    </div>
  );
};
