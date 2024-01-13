import { useState } from 'react';
import { CompletedFlights } from './CompletedFlights';
import { MapCard } from './MapCard';
import { ProfileCard } from './ProfileCard';
import { UpcomingFlights } from './UpcomingFlights';

export const Profile = (): JSX.Element => {
  const [isMapFullScreen, setIsMapFullScreen] = useState(false);
  return (
    <div className="flex flex-row flex-wrap gap-4">
      {!isMapFullScreen ? <ProfileCard /> : null}
      <MapCard
        isMapFullScreen={isMapFullScreen}
        setIsMapFullScreen={setIsMapFullScreen}
      />
      <div className="flex flex-row flex-wrap gap-4">
        <CompletedFlights />
        <UpcomingFlights />
      </div>
    </div>
  );
};
