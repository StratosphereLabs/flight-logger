import classNames from 'classnames';
import {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { type Control, useWatch } from 'react-hook-form';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  Button,
  Form,
  Loading,
  LoadingCard,
  Select,
  useFormWithQueryParams,
} from 'stratosphere-ui';
import {
  CollapseIcon,
  ExpandIcon,
  FireIcon,
  GlobeIcon,
  MapIcon,
} from '../../../../common/components';
import { useProfilePage, useTRPCErrorHandler } from '../../../../common/hooks';
import { trpc } from '../../../../utils/trpc';
import { type ProfileFilterFormData } from '../../hooks';
import { CesiumMap } from './CesiumMap';
import { DEFAULT_COORDINATES } from './constants';
import { GoogleMap } from './GoogleMap';
import { ProfileOverlay } from './ProfileOverlay';
import { getAirportsData } from './utils';

export interface MapCardFormData {
  mapMode: 'routes' | 'heatmap' | '3d';
}

export interface MapCardProps {
  filtersFormControl: Control<ProfileFilterFormData>;
  isMapFullScreen: boolean;
  selectedAirportId: string | null;
  setIsMapFullScreen: Dispatch<SetStateAction<boolean>>;
  setSelectedAirportId: (newId: string | null) => void;
}

export const MapCard = ({
  filtersFormControl,
  isMapFullScreen,
  selectedAirportId,
  setIsMapFullScreen,
  setSelectedAirportId,
}: MapCardProps): JSX.Element => {
  const isProfilePage = useProfilePage();
  const [, setSearchParams] = useSearchParams();
  const [center, setCenter] = useState(DEFAULT_COORDINATES);
  const [hoverAirportId, setHoverAirportId] = useState<string | null>(null);
  const methods = useFormWithQueryParams<MapCardFormData, ['mapMode']>({
    getDefaultValues: ({ mapMode }) => ({
      mapMode: (mapMode as MapCardFormData['mapMode']) ?? 'routes',
    }),
    getSearchParams: ([mapMode]) => ({
      mapMode: mapMode !== 'routes' ? mapMode : '',
    }),
    includeKeys: ['mapMode'],
  });
  const [mapMode] = useWatch<MapCardFormData, ['mapMode']>({
    control: methods.control,
    name: ['mapMode'],
  });
  const [status, range, year, month, fromDate, toDate] = useWatch<
    ProfileFilterFormData,
    ['status', 'range', 'year', 'month', 'fromDate', 'toDate']
  >({
    control: filtersFormControl,
    name: ['status', 'range', 'year', 'month', 'fromDate', 'toDate'],
  });
  const { username } = useParams();
  const onError = useTRPCErrorHandler();
  const { data: currentFlightData } = trpc.flights.getUserActiveFlight.useQuery(
    {
      username,
    },
    {
      enabled: isProfilePage,
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
  const { data: flightsData } = trpc.flights.getUserFlights.useInfiniteQuery({
    username,
    status,
    range,
    year,
    month,
    fromDate,
    toDate,
    selectedAirportId,
  });
  const flightsCount = useMemo(
    () => flightsData?.pages[0].metadata.itemCount ?? null,
    [flightsData?.pages],
  );
  const currentFlight = useMemo(
    () =>
      currentFlightData !== undefined && currentFlightData !== null
        ? {
            lat: currentFlightData.estimatedLocation.lat,
            lng: currentFlightData.estimatedLocation.lng,
            heading: currentFlightData.estimatedHeading,
            delayStatus: currentFlightData.delayStatus,
            flightRadarStatus: currentFlightData.flightRadarStatus,
            callsign: `${currentFlightData.airline?.icao}${currentFlightData.flightNumber}`,
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
  }, [estimatedLocation]);
  return useMemo(
    () => (
      <LoadingCard
        isLoading={data === undefined}
        className={classNames(
          'transition-size card-bordered relative min-w-[350px] flex-1 bg-base-200 shadow-sm duration-500',
          isMapFullScreen ? 'min-h-[100dvh]' : 'min-h-[calc(100vh-250px)]',
        )}
      >
        {data !== undefined &&
        (mapMode === 'routes' || mapMode === 'heatmap') ? (
          <GoogleMap
            center={center}
            currentFlight={currentFlight}
            data={data}
            hoverAirportId={hoverAirportId}
            methods={methods}
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
        <Form
          className={classNames(
            'pointer-events-none absolute flex w-full justify-between gap-2 p-2',
            isProfilePage ? 'mt-24' : 'mt-16',
          )}
          methods={methods}
        >
          <div className="flex min-w-[240px] max-w-[350px] flex-1 flex-col gap-2">
            <ProfileOverlay />
          </div>
          <div className="flex items-start">
            <div className="flex flex-col items-end justify-end gap-2 sm:flex-row-reverse">
              <div className="flex gap-2">
                <Select
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
                  menuClassName="right-0 w-[150px]"
                  name="mapMode"
                />
                <Button
                  className="btn-sm pointer-events-auto px-3 sm:btn-md"
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
              <div className="flex h-[32px] items-center justify-center rounded-box bg-base-100/50 px-4 backdrop-blur-sm sm:h-[48px]">
                {flightsCount === null ? (
                  <Loading />
                ) : (
                  <>
                    <span className="font-semibold">{flightsCount}</span>
                    <span className="ml-1 opacity-75">
                      Flight{flightsCount !== 1 ? 's' : ''}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </Form>
      </LoadingCard>
    ),
    [
      center,
      currentFlight,
      data,
      flightsCount,
      hoverAirportId,
      isMapFullScreen,
      isProfilePage,
      mapMode,
      methods,
      selectedAirportId,
      setIsMapFullScreen,
      setSearchParams,
      setSelectedAirportId,
    ],
  );
};
