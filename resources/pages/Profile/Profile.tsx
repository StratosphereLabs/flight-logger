import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Card, CardBody } from 'stratosphere-ui';
import { AddFlightForm } from './AddFlightForm';
import { CompletedFlights } from './CompletedFlights';
import { CurrentFlightCard } from './CurrentFlightCard';
import { MapCard } from './MapCard';
import { ProfileCard } from './ProfileCard';
import { TopAirlinesChart } from './TopAirlinesChart';
import { TopAirportsChart } from './TopAirportsChart';
import { TopAircraftTypesChart } from './TopAircraftTypesChart';
import { TopRoutesChart } from './TopRoutesChart';
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
      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col gap-4">
          <UpcomingFlights />
          <CompletedFlights />
        </div>
        <div className="flex flex-1 flex-col gap-4">
          {username === undefined ? (
            <div className="flex flex-col">
              <article className="prose p-1">
                <h4 className="m-0">Add Flight</h4>
              </article>
              <Card className="bg-base-200 shadow-md" compact>
                <CardBody className="gap-4">
                  <AddFlightForm />
                </CardBody>
              </Card>
            </div>
          ) : null}
          <div className="flex flex-1 flex-col">
            <article className="prose p-1">
              <h4 className="m-0">Statistics</h4>
            </article>
            <Card className="flex-1 bg-base-200 shadow-md" compact>
              <CardBody className="gap-4">
                <div className="flex flex-wrap gap-4">
                  <TopAirlinesChart />
                  <TopAircraftTypesChart />
                  <TopAirportsChart />
                  <TopRoutesChart />
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
