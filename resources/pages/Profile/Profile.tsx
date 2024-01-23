import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Card, CardBody } from 'stratosphere-ui';
import { AddFlightForm } from './AddFlightForm';
import { CompletedFlights } from './CompletedFlights';
import { CurrentFlightCard } from './CurrentFlightCard';
import { MapCard } from './MapCard';
import { ProfileCard } from './ProfileCard';
import { UpcomingFlights } from './UpcomingFlights';

export const Profile = (): JSX.Element => {
  const { username } = useParams();
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
      <CurrentFlightCard />
      <div className="flex flex-wrap-reverse gap-4">
        <CompletedFlights />
        <UpcomingFlights />
        {username === undefined ? (
          <div className="flex flex-1 flex-col">
            <article className="prose p-1">
              <h4 className="m-0">Add Flight</h4>
            </article>
            <Card className="w-full bg-base-200 shadow-md" compact>
              <CardBody className="flex-row gap-4">
                <AddFlightForm />
              </CardBody>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  );
};
