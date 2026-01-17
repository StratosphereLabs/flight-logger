import { useStatsigClient } from '@statsig/react-bindings';
import classNames from 'classnames';
import { useCallback, useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useFormWithQueryParams } from 'stratosphere-ui';

import { getIsLoggedIn, useAuthStore } from '../../stores';
import {
  ActiveFlightCard,
  FlightsCard,
  MapCard,
  StatisticsCard,
} from './components';
import { useAddFlightStore } from './components/Flights/addFlightStore';

export interface ProfilePageNavigationState {
  addFlight: boolean;
}

export interface MapCardFormData {
  mapMode: 'routes' | 'heatmap' | '3d';
}

export const Profile = (): JSX.Element => {
  const { client } = useStatsigClient();
  const isLoggedIn = useAuthStore(getIsLoggedIn);
  const [searchParams, setSearchParams] = useSearchParams();
  const { state } = useLocation() as {
    state: ProfilePageNavigationState | null;
  };
  const [initialParams] = useState(searchParams);
  const { isAddingFlight, setIsAddingFlight } = useAddFlightStore();
  const [selectedAirportId, setSelectedAirportIdFn] = useState<string | null>(
    initialParams.get('selectedAirportId') ?? null,
  );
  const methods = useFormWithQueryParams<MapCardFormData, ['mapMode']>({
    getDefaultValues: ({ mapMode }) => ({
      mapMode: (mapMode as MapCardFormData['mapMode']) ?? 'routes',
    }),
    getSearchParams: ([mapMode]) => ({
      mapMode: mapMode !== 'routes' ? mapMode : '',
    }),
    includeKeys: ['mapMode'],
    navigateOptions: {
      replace: true,
    },
  });
  const setSelectedAirportId = useCallback(
    (newId: string | null): void => {
      setSelectedAirportIdFn(newId);
      setSearchParams(
        oldSearchParams => {
          if (newId === null) {
            oldSearchParams.delete('selectedAirportId');
            return oldSearchParams;
          } else {
            return new URLSearchParams({
              ...Object.fromEntries(oldSearchParams),
              selectedAirportId: newId,
            });
          }
        },
        { replace: true },
      );
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
  }, [setIsAddingFlight, state?.addFlight]);
  useEffect(() => {
    client.logEvent('profile_page_viewed');
  }, [client]);
  return (
    <div className="flex flex-1 flex-col">
      <MapCard
        filtersFormControl={filtersFormControl}
        isMapFullScreen={isMapFullScreen}
        mapFormMethods={methods}
        selectedAirportId={selectedAirportId}
        setIsMapFullScreen={setIsMapFullScreen}
        setSelectedAirportId={setSelectedAirportId}
      />
      <div className="flex flex-1 flex-col gap-3 p-2 sm:p-3">
        {isLoggedIn &&
        !isFlightsFullScreen &&
        !isStatsFullScreen &&
        !isAddingFlight ? (
          <ActiveFlightCard />
        ) : null}
        <div
          className={classNames(
            'flex flex-col items-start gap-2 sm:gap-3',
            isAddingFlight ? 'flex-1 lg:flex-col' : 'lg:flex-row',
          )}
        >
          {isLoggedIn && !isStatsFullScreen ? (
            <FlightsCard
              filtersFormControl={filtersFormControl}
              isFlightsFullScreen={isFlightsFullScreen}
              mapFormMethods={methods}
              selectedAirportId={selectedAirportId}
              setIsFlightsFullScreen={setIsFlightsFullScreen}
              setIsMapFullScreen={setIsMapFullScreen}
            />
          ) : null}
          {!isFlightsFullScreen && !isAddingFlight ? (
            <StatisticsCard
              filtersFormControl={filtersFormControl}
              isStatsFullScreen={isStatsFullScreen}
              selectedAirportId={selectedAirportId}
              setIsStatsFullScreen={setIsStatsFullScreen}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};
