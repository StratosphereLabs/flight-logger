import classNames from 'classnames';
import { useCallback, useEffect, useState } from 'react';
import { type Control } from 'react-hook-form';
import { useLocation, useSearchParams } from 'react-router-dom';
import {
  ActiveFlightCard,
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
  const [searchParams, setSearchParams] = useSearchParams();
  const { state } = useLocation() as {
    state: ProfilePageNavigationState | null;
  };
  const [initialParams] = useState(searchParams);
  const [isAddingFlight, setIsAddingFlight] = useState(false);
  const [selectedAirportId, setSelectedAirportIdFn] = useState<string | null>(
    initialParams.get('selectedAirportId') ?? null,
  );
  const setSelectedAirportId = useCallback(
    (newId: string | null): void => {
      setSelectedAirportIdFn(newId);
      setSearchParams(oldSearchParams => {
        if (newId === null) {
          oldSearchParams.delete('selectedAirportId');
          return oldSearchParams;
        } else {
          return {
            ...Object.fromEntries(oldSearchParams),
            selectedAirportId: newId,
          };
        }
      });
    },
    [setSearchParams],
  );
  const [isFlightsFullScreen, setIsFlightsFullScreen] = useState(
    initialParams.get('isFlightsFullScreen') === 'true',
  );
  const [isMapFullScreen, setIsMapFullScreen] = useState(
    initialParams.get('isMapFullScreen') === 'true',
  );
  const [isStatsFullScreen, setIsStatsFullScreen] = useState(
    initialParams.get('isStatsFullScreen') === 'true',
  );
  useEffect(() => {
    if (state?.addFlight === true) {
      setIsAddingFlight(true);
    }
  }, [state?.addFlight]);
  return (
    <div className="flex flex-1 flex-col">
      <MapCard
        filtersFormControl={filtersFormControl}
        isMapFullScreen={isMapFullScreen}
        selectedAirportId={selectedAirportId}
        setIsMapFullScreen={setIsMapFullScreen}
        setSelectedAirportId={setSelectedAirportId}
      />
      <div className="flex flex-1 flex-col gap-2 p-2 sm:gap-5 sm:p-10">
        {!isFlightsFullScreen && !isStatsFullScreen ? (
          <ActiveFlightCard />
        ) : null}
        <div
          className={classNames(
            'flex flex-col items-start gap-2 sm:gap-5',
            isAddingFlight ? 'lg:flex-col' : 'lg:flex-row',
          )}
        >
          {!isStatsFullScreen ? (
            <FlightsCard
              filtersFormControl={filtersFormControl}
              isAddingFlight={isAddingFlight}
              isFlightsFullScreen={isFlightsFullScreen}
              selectedAirportId={selectedAirportId}
              setIsAddingFlight={setIsAddingFlight}
              setIsFlightsFullScreen={setIsFlightsFullScreen}
            />
          ) : null}
          {!isFlightsFullScreen ? (
            <StatisticsCard
              filtersFormControl={filtersFormControl}
              isStatsFullScreen={isStatsFullScreen}
              setIsStatsFullScreen={setIsStatsFullScreen}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};
