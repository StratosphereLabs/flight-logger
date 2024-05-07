import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Loading } from 'stratosphere-ui';
import { PlusIcon, RightArrowIcon } from '../../common/components';
import { darkModeStyle } from '../../common/mapStyle';
import { AppTheme, useThemeStore } from '../../stores';
import { trpc } from '../../utils/trpc';
import { type ProfilePageNavigationState } from '../Profile';
import { FlightRow } from './FlightRow';

export const DEFAULT_COORDINATES = {
  lat: 0,
  lng: 0,
};

export const FollowingMapCard = (): JSX.Element => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_CLIENT_ID as string,
    libraries: ['visualization'],
  });
  const navigate = useNavigate();
  const [center] = useState(DEFAULT_COORDINATES);
  const { theme } = useThemeStore();
  const { data, isLoading } = trpc.flights.getFollowingFlights.useQuery(
    undefined,
    {
      refetchInterval: 60000,
    },
  );
  return (
    <Card className="max-w-[1000px] flex-1 bg-base-100">
      {isLoaded ? (
        <GoogleMap
          mapContainerClassName="rounded-t-box"
          mapContainerStyle={{
            height: '50dvh',
            width: '100%',
          }}
          zoom={3}
          options={{
            center,
            minZoom: 2,
            fullscreenControl: false,
            mapTypeControl: false,
            zoomControl: false,
            streetViewControl: false,
            gestureHandling: 'greedy',
            styles:
              theme === AppTheme.DARK ||
              theme === AppTheme.NIGHT ||
              theme === AppTheme.SUNSET
                ? darkModeStyle
                : undefined,
          }}
        />
      ) : null}
      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <Loading />
        </div>
      ) : null}
      {!isLoading && data !== undefined ? (
        <>
          {data.currentFlights.length > 0 ? (
            <div className="flex flex-col gap-2 p-2">
              <div className="font-semibold">En Route</div>
              {data.currentFlights.map(flight => (
                <FlightRow key={flight.id} flight={flight} />
              ))}
            </div>
          ) : null}
          {data.upcomingFlights.length > 0 ? (
            <div className="flex flex-col gap-2 p-2">
              <div className="font-semibold">Upcoming</div>
              {data.upcomingFlights.map(flight => (
                <FlightRow key={flight.id} flight={flight} />
              ))}
            </div>
          ) : null}
          {data.completedFlights.length > 0 ? (
            <div className="flex flex-col gap-2 p-2">
              <div className="font-semibold">Completed</div>
              {data.completedFlights.map(flight => (
                <FlightRow key={flight.id} flight={flight} />
              ))}
            </div>
          ) : null}
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            {data.completedFlights.length +
              data.currentFlights.length +
              data.upcomingFlights.length ===
            0 ? (
              <article className="prose text-center">
                <h3>No Flights Found</h3>
                <p>Expecting to see something here?</p>
              </article>
            ) : null}
            <div className="my-3 flex flex-wrap justify-center gap-4">
              <Button
                color="accent"
                onClick={() => {
                  navigate('/profile', {
                    state: {
                      addFlight: true,
                    } as const as ProfilePageNavigationState,
                  });
                }}
              >
                Add a Flight <PlusIcon className="h-4 w-4" />
              </Button>
              <Button
                color="info"
                onClick={() => {
                  navigate('/users');
                }}
              >
                Find Users <RightArrowIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      ) : null}
    </Card>
  );
};
