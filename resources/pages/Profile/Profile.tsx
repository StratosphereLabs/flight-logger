import { MapCard } from './MapCard';
import { ProfileCard } from './ProfileCard';

export const Profile = (): JSX.Element => (
  <div className="flex flex-row flex-wrap justify-center gap-4">
    <ProfileCard />
    <MapCard />
  </div>
);
