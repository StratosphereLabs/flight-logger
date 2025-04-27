import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import classNames from 'classnames';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Loading } from 'stratosphere-ui';

import {
  CARD_BORDER_COLORS,
  CARD_BORDER_COLORS_LOFI,
  CARD_COLORS,
  CARD_COLORS_LOFI,
} from '../../common/constants';
import { darkModeStyle, lightModeStyle } from '../../common/mapStyle';
import { useMainLayoutStore } from '../../layouts/MainLayout/mainLayoutStore';
import { AppTheme, useIsDarkMode, useThemeStore } from '../../stores';
import { trpc } from '../../utils/trpc';
import { DEFAULT_COORDINATES } from '../Home/constants';
import { FlightChangelogTable } from './FlightChangelogTable';
import { FlightInfo } from './FlightInfo';
import { OnTimePerformanceChart } from './OnTimePerformanceChart';
import { WeatherInfo } from './WeatherInfo';

export interface FlightPageNavigationState {
  previousPageName: string;
}

export const Flight = (): JSX.Element | null => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_CLIENT_ID as string,
    libraries: ['visualization'],
  });
  const { flightId } = useParams();
  const [, setMap] = useState<google.maps.Map | null>(null);
  const { data } = trpc.flights.getFlight.useQuery(
    { id: flightId ?? '' },
    { enabled: flightId !== undefined },
  );
  const { setPreviousPageName } = useMainLayoutStore();
  const { theme } = useThemeStore();
  const { state } = useLocation() as {
    state: FlightPageNavigationState | null;
  };
  const [center] = useState(DEFAULT_COORDINATES);
  const isDarkMode = useIsDarkMode();
  const options = useMemo(
    () => ({
      center,
      minZoom: 2,
      fullscreenControl: false,
      mapTypeControl: false,
      zoomControl: false,
      streetViewControl: false,
      gestureHandling: 'greedy',
      styles: isDarkMode ? darkModeStyle : lightModeStyle,
      isFractionalZoomEnabled: true,
    }),
    [center, isDarkMode],
  );
  useEffect(() => {
    if (state !== null) {
      setPreviousPageName(state.previousPageName);
    }
  }, [setPreviousPageName, state]);
  if (flightId === undefined) return null;
  return (
    <div className="relative h-[calc(100vh-60px)] w-screen">
      {isLoaded && (
        <GoogleMap
          mapContainerStyle={{
            height: '100%',
            width: '100%',
          }}
          zoom={3}
          options={options}
          onLoad={map => {
            setMap(map);
          }}
        />
      )}
      <div className="rounded-box bg-base-100/80 absolute top-2 left-2 mt-24 flex h-[calc(100%-112px)] w-[375px] justify-center backdrop-blur-sm">
        {data !== undefined ? (
          <div
            className={classNames(
              'rounded-box flex-1 overflow-y-scroll border-2 p-2',
              theme === AppTheme.LOFI
                ? CARD_COLORS_LOFI[data.delayStatus]
                : CARD_COLORS[data.delayStatus],
              theme === AppTheme.LOFI
                ? CARD_BORDER_COLORS_LOFI[data.delayStatus]
                : CARD_BORDER_COLORS[data.delayStatus],
            )}
          >
            <FlightInfo />
            <OnTimePerformanceChart flightId={flightId} />
            <WeatherInfo flightId={flightId} />
            <FlightChangelogTable flightId={flightId} />
          </div>
        ) : (
          <Loading />
        )}
      </div>
    </div>
  );
};
