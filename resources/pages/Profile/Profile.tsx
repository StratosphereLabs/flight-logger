import { useEffect, useState } from 'react';
import { type Control } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import {
  CompletedFlights,
  CurrentFlightCard,
  MapCard,
  Statistics,
  UpcomingFlights,
} from './components';
import { type ProfileFilterFormData } from './hooks';

export interface ProfileProps {
  filtersFormControl: Control<ProfileFilterFormData>;
}

export const Profile = ({ filtersFormControl }: ProfileProps): JSX.Element => {
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
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-3 overflow-y-scroll px-2 pb-2 pt-2 sm:px-3 sm:pb-3">
        <div className="flex flex-wrap gap-4">
          <MapCard
            filtersFormControl={filtersFormControl}
            isMapFullScreen={isMapFullScreen}
            setIsMapFullScreen={setIsMapFullScreen}
          />
        </div>
        <CurrentFlightCard />
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex flex-row flex-wrap gap-4 lg:flex-col">
            <UpcomingFlights />
            <CompletedFlights />
          </div>
          <div className="flex flex-1 flex-col gap-4">
            {/* {username === undefined ? (
              <div className="flex flex-col">
                <article className="prose p-1">
                  <h4 className="m-0">Add Flight</h4>
                </article>
                <Card className="bg-base-200 shadow-sm" compact>
                  <CardBody className="gap-4">
                    <AddFlightForm />
                  </CardBody>
                </Card>
              </div>
            ) : null} */}
            <Statistics filtersFormControl={filtersFormControl} />
          </div>
        </div>
      </div>
    </div>
  );
};
