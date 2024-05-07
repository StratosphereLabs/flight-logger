import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import classNames from 'classnames';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Card, Link, Loading } from 'stratosphere-ui';
import { FlightTimesDisplay } from '../../common/components';
import {
  CARD_BORDER_COLORS,
  CARD_BORDER_COLORS_LOFI,
  CARD_COLORS,
  CARD_COLORS_LOFI,
  TEXT_COLORS,
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
                'flex items-center gap-2 rounded-box border-2 px-2 py-0 text-sm sm:gap-4 sm:py-1',
                theme === AppTheme.LOFI
                  ? CARD_COLORS_LOFI[flight.delayStatus]
                  : CARD_COLORS[flight.delayStatus],
                theme === AppTheme.LOFI
                  ? CARD_BORDER_COLORS_LOFI[flight.delayStatus]
                  : CARD_BORDER_COLORS[flight.delayStatus],
              )}
            >
              <div className="font-mono text-xs opacity-75 sm:text-sm">
                {flight.outDateLocalAbbreviated}
              </div>
              <div className="flex flex-[3] items-center gap-2 truncate sm:flex-[2]">
                <Avatar
                  className="hidden md:block"
                  shapeClassName="w-8 h-8 rounded-full"
                >
                  <img alt={flight.user.username} src={flight.user.avatar} />
                </Avatar>
                <Link
                  hover
                  onClick={() => {
                    navigate(`/user/${flight.user.username}`);
                  }}
                  className="truncate text-xs font-semibold opacity-90 sm:text-sm"
                >
                  {flight.user.username}
                </Link>
              </div>
              {flight.airline?.logo !== null &&
              flight.airline?.logo !== undefined ? (
                <div className="flex hidden w-[80px] justify-center md:block">
                  <img
                    alt={`${flight.airline.name} Logo`}
                    className="max-h-[32px] max-w-[80px]"
                    src={flight.airline.logo}
                  />
                </div>
              ) : null}
              <div className="w-[50px] text-nowrap font-mono text-xs sm:w-[60px] sm:text-sm">
                <Link
                  hover
                  href={`https://www.flightaware.com/live/flight/${flight.airline?.icao}${flight.flightNumber}`}
                  target="_blank"
                >
                  {flight.flightNumberString}
                </Link>
              </div>
              <div className="flex flex-[3] flex-col">
                <div className="flex flex-wrap items-center gap-x-3">
                  <div className="font-mono font-semibold sm:text-lg">
                    {flight.departureAirport.iata}
                  </div>
                  <FlightTimesDisplay
                    data={{
                      delayStatus: flight.departureDelayStatus,
                      actualValue: flight.outTimeActualValue,
                      value: flight.outTimeValue,
                      actualLocal: flight.outTimeActualLocal,
                      local: flight.outTimeLocal,
                      actualDaysAdded: flight.outTimeActualDaysAdded,
                      daysAdded: 0,
                    }}
                  />
                </div>
                <div className="hidden truncate text-xs opacity-75 sm:block">
                  {flight.departureAirport.municipality},{' '}
                  {flight.departureAirport.countryId === 'US'
                    ? flight.departureAirport.region.name
                    : flight.departureAirport.countryId}
                </div>
              </div>
              <div className="flex flex-[3] flex-col">
                <div className="flex flex-wrap items-center gap-x-3">
                  <div className="font-mono font-semibold sm:text-lg">
                    {flight.arrivalAirport.iata}
                  </div>
                  <FlightTimesDisplay
                    data={{
                      delayStatus: flight.arrivalDelayStatus,
                      actualValue: flight.inTimeActualValue,
                      value: flight.inTimeValue,
                      actualLocal: flight.inTimeActualLocal,
                      local: flight.inTimeLocal,
                      actualDaysAdded: flight.inTimeActualDaysAdded,
                      daysAdded: flight.inTimeDaysAdded,
                    }}
                  />
                </div>
                <div className="hidden truncate text-xs opacity-75 sm:block">
                  {flight.arrivalAirport.municipality},{' '}
                  {flight.arrivalAirport.countryId === 'US'
                    ? flight.arrivalAirport.region.name
                    : flight.arrivalAirport.countryId}
                </div>
              </div>
              <div className="flex h-full flex-[2] flex-col items-end justify-between text-xs sm:text-sm">
                <div
                  className={classNames(
                    'mt-[-2px] flex flex-wrap justify-end gap-x-1 text-right sm:mt-[-5px]',
                    flight.delayStatus !== 'none' && 'font-semibold',
                    TEXT_COLORS[flight.delayStatus],
                  )}
                >
                  {flight.delayStatus !== 'none' ? (
                    <>
                      Delayed{' '}
                      <span className="text-nowrap">{flight.delay}</span>
                    </>
                  ) : (
                    'On Time'
                  )}
                </div>
                <div className="flex">
                  {flight.aircraftType !== null ? (
                    <div className="hidden opacity-75 sm:block">
                      {flight.aircraftType.icao}
                    </div>
                  ) : null}
                  {flight.tailNumber !== null &&
                  flight.tailNumber.length > 0 ? (
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
            </div>
          ))}
        </div>
      ) : null}
    </Card>
  );
};
