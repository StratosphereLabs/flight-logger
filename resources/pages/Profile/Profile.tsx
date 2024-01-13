import { CompletedFlights } from './CompletedFlights';
import { MapCard } from './MapCard';
import { ProfileCard } from './ProfileCard';
import { UpcomingFlights } from './UpcomingFlights';

export const Profile = (): JSX.Element => (
  <div className="flex flex-row flex-wrap gap-4">
    <ProfileCard />
    <MapCard />
    <div className="flex flex-row flex-wrap gap-4">
      <CompletedFlights />
      <UpcomingFlights />
    </div>
  </div>
);
