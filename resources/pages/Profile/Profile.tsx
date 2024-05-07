import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { type Control } from 'react-hook-form';
import { useLocation, useSearchParams } from 'react-router-dom';
import {
  CurrentFlightCard,
  FlightsCard,
  MapCard,
  StatisticsCard,
} from './components';
import { type ProfileFilterFormData } from './hooks';

export interface ProfileProps {
  filtersFormControl: Control<ProfileFilterFormData>;
}

export interface ProfilePageNavigationState {
  addFlight: boolean;
}

export const Profile = ({ filtersFormControl }: ProfileProps): JSX.Element => {
  const [searchParams] = useSearchParams();
  const { state } = useLocation() as {
    state: ProfilePageNavigationState | null;
  };
  const [initialParams] = useState(searchParams);
  const [isAddingFlight, setIsAddingFlight] = useState(false);
  const [isMapFullScreen, setIsMapFullScreen] = useState(
    initialParams.get('isMapFullScreen') === 'true',
  );
  useEffect(() => {
    if (state?.addFlight === true) {
      setIsAddingFlight(true);
    }
  }, [state?.addFlight]);
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
        <div
          className={classNames(
            'flex flex-col items-start gap-4',
            isAddingFlight ? 'lg:flex-col' : 'lg:flex-row',
          )}
        >
          <FlightsCard
            isAddingFlight={isAddingFlight}
            setIsAddingFlight={setIsAddingFlight}
          />
          <StatisticsCard filtersFormControl={filtersFormControl} />
        </div>
      </div>
    </div>
  );
};
