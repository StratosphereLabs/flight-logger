import { useStatsigClient } from '@statsig/react-bindings';
import { useLocation } from '@tanstack/react-router';
import classNames from 'classnames';
import { useEffect } from 'react';

import {
  useFormWithSearchParams,
  useStateWithSearchParam,
} from '../../common/hooks';
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
  const { pathname, state } = useLocation();
  const { isAddingFlight, setIsAddingFlight } = useAddFlightStore();
  const navigateFrom = pathname.includes('/profile')
    ? '/pathlessProfileLayout/profile'
    : '/pathlessProfileLayout/user/$username';
  const methods = useFormWithSearchParams<MapCardFormData, ['mapMode']>({
    from: navigateFrom,
    defaultValues: {
      mapMode: 'routes',
    },
    includeKeys: ['mapMode'],
  });
  const [selectedAirportId, setSelectedAirportId] = useStateWithSearchParam<
    string | null
  >(null, 'selectedAirportId', navigateFrom);
  const [isFlightsFullScreen, setIsFlightsFullScreen] = useStateWithSearchParam(
    false,
    'isFlightsFullScreen',
    navigateFrom,
  );
  const [isMapFullScreen, setIsMapFullScreen] = useStateWithSearchParam(
    false,
    'isMapFullScreen',
    navigateFrom,
  );
  const [isStatsFullScreen, setIsStatsFullScreen] = useStateWithSearchParam(
    false,
    'isStatsFullScreen',
    navigateFrom,
  );
  useEffect(() => {
    if (state.addFlight === true) {
      setIsAddingFlight(true);
    }
  }, [setIsAddingFlight, state.addFlight]);
  useEffect(() => {
    client.logEvent('profile_page_viewed');
  }, [client]);
  return (
    <div className="flex flex-1 flex-col">
      <MapCard
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
              isFlightsFullScreen={isFlightsFullScreen}
              mapFormMethods={methods}
              selectedAirportId={selectedAirportId}
              setIsFlightsFullScreen={setIsFlightsFullScreen}
              setIsMapFullScreen={setIsMapFullScreen}
            />
          ) : null}
          {!isFlightsFullScreen && !isAddingFlight ? (
            <StatisticsCard
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
