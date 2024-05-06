import { getIsLoggedIn, useAuthStore } from '../../stores';
import { FollowingMapCard } from './FollowingMapCard';
import { WelcomeHero } from './WelcomeHero';

export const Home = (): JSX.Element => {
  const isLoggedIn = useAuthStore(getIsLoggedIn);
  return isLoggedIn ? (
    <div className="flex flex-1 justify-center p-3">
      <FollowingMapCard />
    </div>
  ) : (
    <div className="flex flex-1 flex-col items-center justify-center">
      <WelcomeHero />
    </div>
  );
};
