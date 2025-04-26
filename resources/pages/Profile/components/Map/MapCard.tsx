import classNames from 'classnames';
import {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { type Control, type UseFormReturn, useWatch } from 'react-hook-form';
import { useParams, useSearchParams } from 'react-router-dom';
import { Button, Form, LoadingCard, Select } from 'stratosphere-ui';

import {
  CollapseIcon,
  ExpandIcon,
  FireIcon,
  GlobeIcon,
  MapIcon,
} from '../../../../common/components';
import { useProfilePage, useTRPCErrorHandler } from '../../../../common/hooks';
import { getIsLoggedIn, useAuthStore } from '../../../../stores';
import { trpc } from '../../../../utils/trpc';
import { type MapCardFormData } from '../../Profile';
import { type ProfileFilterFormData } from '../../hooks';
import { useAddFlightStore } from '../Flights/addFlightStore';
import { CesiumMap } from './CesiumMap';
import { GoogleMap } from './GoogleMap';
import { ProfileOverlay } from './ProfileOverlay';
import { DEFAULT_COORDINATES } from './constants';
import { getAirportsData } from './utils';

export interface MapCardProps {
  filtersFormControl: Control<ProfileFilterFormData>;
  isMapFullScreen: boolean;
  mapFormMethods: UseFormReturn<MapCardFormData>;
  selectedAirportId: string | null;
  setIsMapFullScreen: Dispatch<SetStateAction<boolean>>;
  setSelectedAirportId: (newId: string | null) => void;
}

export const MapCard = ({
  filtersFormControl,
  isMapFullScreen,
  mapFormMethods,
  selectedAirportId,
  setIsMapFullScreen,
  setSelectedAirportId,
}: MapCardProps): JSX.Element => {
  const isLoggedIn = useAuthStore(getIsLoggedIn);
  const isProfilePage = useProfilePage();
  const [, setSearchParams] = useSearchParams();
  const { isAddingFlight } = useAddFlightStore();
  const [center, setCenter] = useState(DEFAULT_COORDINATES);
  const [hoverAirportId, setHoverAirportId] = useState<string | null>(null);
  const [mapMode] = useWatch<MapCardFormData, ['mapMode']>({
    control: mapFormMethods.control,
    name: ['mapMode'],
  });
  const [status, range, year, month, fromDate, toDate, searchQuery] = useWatch<
    ProfileFilterFormData,
    ['status', 'range', 'year', 'month', 'fromDate', 'toDate', 'searchQuery']
  >({
    control: filtersFormControl,
    name: [
      'status',
      'range',
      'year',
      'month',
      'fromDate',
      'toDate',
      'searchQuery',
    ],
  });
  const { username } = useParams();
  const onError = useTRPCErrorHandler();
  const { data: currentFlightData } = trpc.flights.getUserActiveFlight.useQuery(
    {
      username,
    },
    {
      enabled: isLoggedIn,
      onError,
    },
  );
  const { data } = trpc.flights.getUserMapData.useQuery(
    {
      username,
      status,
      range,
      year,
      month,
      fromDate,
      toDate,
      searchQuery,
    },
    {
      enabled: isProfilePage,
      keepPreviousData: true,
      select: mapData => {
        const routes = mapData.routes.map(route => ({
          ...route,
          isSelected: route.airports.some(({ id }) => id === selectedAirportId),
        }));
        return {
          ...mapData,
          routes,
          airports: getAirportsData(
            mapData.routes.map(({ airports }) => airports),
            selectedAirportId,
          ),
        };
      },
      staleTime: 5 * 60 * 1000,
      onError,
    },
  );
  const currentFlight = useMemo(
    () =>
      currentFlightData !== undefined && currentFlightData !== null
        ? {
            lat: currentFlightData.estimatedLocation.lat,
            lng: currentFlightData.estimatedLocation.lng,
            heading: currentFlightData.estimatedHeading,
            delayStatus: currentFlightData.delayStatus,
            flightStatus: currentFlightData.flightStatus,
            callsign:
              currentFlightData.callsign ??
              `${currentFlightData.airline?.icao}${currentFlightData.flightNumber}`,
            tracklog: currentFlightData.tracklog,
            waypoints: currentFlightData.waypoints,
          }
        : undefined,
    [currentFlightData],
  );
  const estimatedLocation = currentFlightData?.estimatedLocation;
  useEffect(() => {
    if (estimatedLocation !== undefined) {
      setCenter(estimatedLocation);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFlightData?.id]);
  return useMemo(
    () => (
      <LoadingCard
        isLoading={data === undefined}
        className={classNames(
          'transition-size card-bordered bg-base-200 relative min-w-[350px] flex-1 shadow-xs duration-500',
          isMapFullScreen
            ? 'min-h-[100dvh]'
            : isAddingFlight
              ? 'min-h-[50vh]'
              : 'min-h-[calc(100vh-210px)]',
        )}
      >
        {data !== undefined &&
        (mapMode === 'routes' || mapMode === 'heatmap') ? (
          <GoogleMap
            center={center}
            currentFlight={currentFlight}
            data={data}
            hoverAirportId={hoverAirportId}
            methods={mapFormMethods}
            selectedAirportId={selectedAirportId}
            setSelectedAirportId={setSelectedAirportId}
            setHoverAirportId={setHoverAirportId}
          />
        ) : null}
        {data !== undefined && mapMode === '3d' ? (
          <CesiumMap
            center={center}
            currentFlight={currentFlight}
            data={data}
            hoverAirportId={hoverAirportId}
            selectedAirportId={selectedAirportId}
            setHoverAirportId={setHoverAirportId}
            setSelectedAirportId={setSelectedAirportId}
          />
        ) : null}
        {!isAddingFlight ? (
          <Form
            className={classNames(
              'pointer-events-none absolute flex w-full justify-between gap-2 p-2',
              isProfilePage && !isAddingFlight ? 'mt-[102px]' : 'mt-16',
            )}
            methods={mapFormMethods}
          >
            <div className="flex max-w-[350px] min-w-[240px] flex-1 flex-col gap-2">
              <ProfileOverlay />
            </div>
            <div className="flex items-start">
              <div className="flex flex-col items-end justify-end gap-2 sm:flex-row-reverse">
                <div className="flex gap-2">
                  <Select
                    anchor="bottom end"
                    buttonProps={{
                      className: 'btn-sm sm:btn-md',
                      children:
                        mapMode === 'routes' ? (
                          <MapIcon className="h-6 w-6" />
                        ) : mapMode === '3d' ? (
                          <GlobeIcon className="h-6 w-6" />
                        ) : (
                          <FireIcon className="h-6 w-6" />
                        ),
                      soft: true,
                    }}
                    className="pointer-events-auto"
                    formValueMode="id"
                    getItemText={({ text }) => text}
                    hideDropdownIcon
                    options={[
                      {
                        id: 'routes',
                        text: 'Routes',
                      },
                      {
                        id: 'heatmap',
                        text: 'Heatmap',
                      },
                      {
                        id: '3d',
                        text: '3D',
                      },
                    ]}
                    menuClassName="w-[150px] bg-base-200 z-50"
                    name="mapMode"
                  />
                  <Button
                    className="btn-sm sm:btn-md pointer-events-auto px-3"
                    onClick={() => {
                      setIsMapFullScreen(isFullScreen => {
                        const newValue = !isFullScreen;
                        setSearchParams(oldSearchParams => {
                          if (newValue) {
                            return {
                              ...Object.fromEntries(oldSearchParams),
                              isMapFullScreen: 'true',
                            };
                          } else {
                            oldSearchParams.delete('isMapFullScreen');
                            return oldSearchParams;
                          }
                        });
                        return newValue;
                      });
                    }}
                    soft
                    title={isMapFullScreen ? 'Collapse Map' : 'Expand Map'}
                  >
                    {isMapFullScreen ? (
                      <CollapseIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                    ) : (
                      <ExpandIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                    )}
                    <span className="sr-only">
                      {isMapFullScreen ? 'Collapse Map' : 'Expand Map'}
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </Form>
        ) : null}
      </LoadingCard>
    ),
    [
      center,
      currentFlight,
      data,
      hoverAirportId,
      isAddingFlight,
      isMapFullScreen,
      isProfilePage,
      mapFormMethods,
      mapMode,
      selectedAirportId,
      setIsMapFullScreen,
      setSearchParams,
      setSelectedAirportId,
    ],
  );
};
