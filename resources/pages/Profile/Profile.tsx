import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CompletedFlights } from './CompletedFlights';
import { CurrentFlightCard } from './CurrentFlightCard';
import { MapCard } from './MapCard';
import { ProfileCard } from './ProfileCard';
import { UpcomingFlights } from './UpcomingFlights';

export const Profile = (): JSX.Element => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [initialParams] = useState(searchParams);
  const [isMapFullScreen, setIsMapFullScreen] = useState(
    initialParams.get('isMapFullScreen') === 'true',
  );
  useEffect(() => {
    setSearchParams(oldSearchParams => ({
      ...Object.fromEntries(oldSearchParams),
      isMapFullScreen: isMapFullScreen.toString(),
    }));
  }, [isMapFullScreen, setSearchParams]);
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-wrap gap-4">
        {!isMapFullScreen ? <ProfileCard /> : null}
        <MapCard
          isMapFullScreen={isMapFullScreen}
          setIsMapFullScreen={setIsMapFullScreen}
        />
      </div>
      <CurrentFlightCard isMapFullScreen={isMapFullScreen} />
      <div className="flex flex-wrap gap-6">
        <CompletedFlights />
        <UpcomingFlights />
      </div>
    </div>
  );
};
