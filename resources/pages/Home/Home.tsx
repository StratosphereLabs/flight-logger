import { getIsLoggedIn, useAuthStore } from '../../stores';
import { FollowingMap } from './FollowingMap';
import { WelcomeHero } from './WelcomeHero';

export const Home = (): JSX.Element => {
  const isLoggedIn = useAuthStore(getIsLoggedIn);
  return isLoggedIn ? (
    <FollowingMap />
  ) : (
    <div className="flex flex-1 flex-col items-center justify-center">
      <WelcomeHero />
    </div>
  );
};
