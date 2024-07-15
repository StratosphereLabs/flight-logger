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
import { CollapseIcon, ExpandIcon } from '../../../../common/components';
import { useProfilePage, useTRPCErrorHandler } from '../../../../common/hooks';
import { trpc } from '../../../../utils/trpc';
import { type ProfileFilterFormData } from '../../hooks';
import { AirportInfoOverlay } from './AirportInfoOverlay';
import { CesiumMap } from './CesiumMap';
import { DEFAULT_COORDINATES } from './constants';
import { GoogleMap } from './GoogleMap';
import { ProfileOverlay } from './ProfileOverlay';
import { getAirports } from './utils';

export interface MapCardFormData {
  mapMode: 'routes' | 'heatmap' | '3d';
}

export interface MapCardProps {
  filtersFormControl: Control<ProfileFilterFormData>;
  isMapFullScreen: boolean;
  setIsMapFullScreen: Dispatch<SetStateAction<boolean>>;
}

export const MapCard = ({
  filtersFormControl,
  isMapFullScreen,
  setIsMapFullScreen,
}: MapCardProps): JSX.Element => {
  const enabled = useProfilePage();
  const [, setSearchParams] = useSearchParams();
  const [center, setCenter] = useState(DEFAULT_COORDINATES);
  const [hoverAirportId, setHoverAirportId] = useState<string | null>(null);
  const [selectedAirportId, setSelectedAirportId] = useState<string | null>(
    null,
  );
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
      enabled,
      onError,
    },
  );
  const { data: countData, isFetching: isCountsFetching } =
    trpc.statistics.getCounts.useQuery({
      username,
      status,
      range,
      year,
      month,
      fromDate,
      toDate,
    });
  const { data, isFetching: isMapDataFetching } =
    trpc.flights.getUserMapData.useQuery(
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
        enabled,
        keepPreviousData: true,
        select: mapData => {
          const filteredRoutes = mapData.routes.flatMap(route => ({
            ...route,
            isHover: route.airports.some(({ id }) => id === hoverAirportId),
            isSelected: route.airports.some(
              ({ id }) => id === selectedAirportId,
            ),
          }));
          return {
            ...mapData,
            routes: filteredRoutes,
            airports: getAirports(filteredRoutes),
            numFlights: filteredRoutes.reduce(
              (acc, { frequency }) => acc + frequency,
              0,
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
          }
        : undefined,
    [currentFlightData],
  );
  const mapCenterpoint =
    currentFlightData?.estimatedLocation ?? data?.centerpoint;
  useEffect(() => {
    const selectedAirport = data?.airports.find(
      ({ id }) => id === selectedAirportId,
    );
    if (selectedAirport === undefined) {
      setSelectedAirportId(null);
    } else {
      setCenter({
        lat: selectedAirport.lat,
        lng: selectedAirport.lon,
      });
    }
  }, [data?.airports, selectedAirportId]);
  useEffect(() => {
    if (mapCenterpoint !== undefined) setCenter(mapCenterpoint);
  }, [mapCenterpoint]);
  return useMemo(
    () => (
      <LoadingCard
        isLoading={data === undefined}
        className={classNames(
          'transition-size card-bordered relative min-w-[350px] flex-1 bg-base-200 shadow-sm duration-500',
          isMapFullScreen
            ? 'min-h-[calc(100dvh-155px)]'
            : 'min-h-[calc(100dvh-155px-225px)]',
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
          className="pointer-events-none absolute flex w-full justify-between gap-2 p-2"
          methods={methods}
        >
          <div className="flex flex-col gap-2">
            <ProfileOverlay />
            <AirportInfoOverlay
              airportId={selectedAirportId}
              filtersFormControl={filtersFormControl}
            />
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex flex-wrap-reverse justify-end gap-2">
              <div className="flex h-[32px] w-full min-w-[125px] max-w-[150px] items-center justify-center rounded-box bg-base-100/50 backdrop-blur-sm sm:h-[48px]">
                {isMapDataFetching ||
                isCountsFetching ||
                countData === undefined ? (
                  <Loading />
                ) : (
                  <>
                    <span className="font-semibold">
                      {countData.completedFlightCount}
                    </span>
                    <span className="ml-1 opacity-75">
                      Flight{countData.completedFlightCount !== 1 ? 's' : ''}
                    </span>
                  </>
                )}
              </div>
              <div className="flex flex-wrap-reverse justify-end gap-2">
                <Select
                  buttonProps={{
                    className: 'btn-sm sm:btn-md',
                  }}
                  className="pointer-events-auto w-[125px] sm:w-[150px]"
                  formValueMode="id"
                  getItemText={({ text }) => text}
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
                  menuClassName="right-0 w-full menu-sm sm:menu-md"
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
            </div>
          </div>
        </Form>
      </LoadingCard>
    ),
    [
      center,
      countData,
      currentFlight,
      data,
      filtersFormControl,
      hoverAirportId,
      isCountsFetching,
      isMapDataFetching,
      isMapFullScreen,
      mapMode,
      methods,
      selectedAirportId,
      setIsMapFullScreen,
      setSearchParams,
    ],
  );
};
