import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import classNames from 'classnames';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, Badge, Card, Loading } from 'stratosphere-ui';
import {
  CARD_BORDER_COLORS,
  CARD_BORDER_COLORS_LOFI,
  CARD_COLORS,
  CARD_COLORS_LOFI,
} from '../../common/constants';
import { darkModeStyle } from '../../common/mapStyle';
import { AppTheme, useThemeStore } from '../../stores';
import { trpc } from '../../utils/trpc';

export const DEFAULT_COORDINATES = {
  lat: 0,
  lng: 0,
};

export const FollowingMapCard = (): JSX.Element => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_CLIENT_ID as string,
    libraries: ['visualization'],
  });
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
            height: '45dvh',
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
        <div className="flex flex-col gap-2 p-2">
          {data.map(flight => (
            <div
              key={flight.id}
              className={classNames(
                'flex items-center gap-2 rounded-box border-2 px-2 py-1 text-sm',
                theme === AppTheme.LOFI
                  ? CARD_COLORS_LOFI[flight.delayStatus]
                  : CARD_COLORS[flight.delayStatus],
                theme === AppTheme.LOFI
                  ? CARD_BORDER_COLORS_LOFI[flight.delayStatus]
                  : CARD_BORDER_COLORS[flight.delayStatus],
              )}
            >
              <Badge className="mr-2" color="primary" size="sm">
                {flight.outDateISO}
              </Badge>
              <Avatar shapeClassName="w-8 h-8 rounded-full">
                <img alt={flight.user.username} src={flight.user.avatar} />
              </Avatar>
              <Link
                to={`/user/${flight.user.username}`}
                className="link-hover link font-semibold"
              >
                {flight.user.username}
              </Link>
              <div className="flex-1"></div>
              <div className="flex">
                {flight.aircraftType !== null ? (
                  <div className="opacity-75">{flight.aircraftType.icao}</div>
                ) : null}
                {flight.tailNumber !== null && flight.tailNumber.length > 0 ? (
                  <a
                    className="link-hover link ml-3 pt-[1px] font-mono font-semibold"
                    href={
                      flight.airframe !== null
                        ? `https://www.planespotters.net/hex/${flight.airframe.icao24.toUpperCase()}`
                        : `https://www.flightaware.com/resources/registration/${flight.tailNumber}`
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    {flight.tailNumber}
                  </a>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </Card>
  );
};
