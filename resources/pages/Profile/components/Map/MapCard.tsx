import classNames from 'classnames';
import {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useWatch } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import {
  Avatar,
  Button,
  Form,
  FormCheckbox,
  LoadingCard,
  Select,
  useFormWithQueryParams,
} from 'stratosphere-ui';
import {
  CollapseIcon,
  ExpandIcon,
  UserOutlineIcon,
  UserSolidIcon,
} from '../../../../common/components';
import { useProfilePage, useTRPCErrorHandler } from '../../../../common/hooks';
import { trpc } from '../../../../utils/trpc';
import { AirportInfoOverlay } from './AirportInfoOverlay';
import { CesiumMap } from './CesiumMap';
import { DEFAULT_COORDINATES } from './constants';
import { GoogleMap } from './GoogleMap';
import { getAirports } from './utils';

export interface MapCardFormData {
  showUpcoming: boolean;
  showCompleted: boolean;
  mapMode: 'routes' | 'heatmap' | '3d';
}

export interface MapCardProps {
  isMapFullScreen: boolean;
  setIsMapFullScreen: Dispatch<SetStateAction<boolean>>;
}

export const MapCard = ({
  isMapFullScreen,
  setIsMapFullScreen,
}: MapCardProps): JSX.Element => {
  const enabled = useProfilePage();
  const [center, setCenter] = useState(DEFAULT_COORDINATES);
  const [hoverAirportId, setHoverAirportId] = useState<string | null>(null);
  const [selectedAirportId, setSelectedAirportId] = useState<string | null>(
    null,
  );
  const methods = useFormWithQueryParams<
    MapCardFormData,
    ['mapMode', 'showCompleted', 'showUpcoming']
  >({
    getDefaultValues: ({ mapMode, showCompleted, showUpcoming }) => ({
      showUpcoming: showUpcoming === 'true',
      showCompleted:
        showCompleted !== null && showCompleted !== undefined
          ? showCompleted === 'true'
          : true,
      mapMode: (mapMode as MapCardFormData['mapMode']) ?? 'routes',
    }),
    getSearchParams: ([mapMode, showCompleted, showUpcoming]) => ({
      mapMode,
      showCompleted: showCompleted.toString(),
      showUpcoming: showUpcoming.toString(),
    }),
    includeKeys: ['mapMode', 'showCompleted', 'showUpcoming'],
  });
  const [showUpcoming, showCompleted, mapMode] = useWatch<
    MapCardFormData,
    ['showUpcoming', 'showCompleted', 'mapMode']
  >({
    control: methods.control,
    name: ['showUpcoming', 'showCompleted', 'mapMode'],
  });
  const { username } = useParams();
  const { data: userData } = trpc.users.getUser.useQuery(
    { username },
    {
      enabled,
      staleTime: 5 * 60 * 1000,
    },
  );
  const { data: currentFlightData } = trpc.users.getUserCurrentFlight.useQuery(
    {
      username,
    },
    {
      enabled,
    },
  );
  const { data, error, isLoading } = trpc.users.getUserMapData.useQuery(
    {
      username,
    },
    {
      enabled,
      select: mapData => {
        const filteredHeatmapData = mapData.heatmap.flatMap(
          ({ inFuture, lat, lng }) =>
            (showUpcoming || !inFuture) && (showCompleted || inFuture)
              ? [{ lat, lng }]
              : [],
        );
        const filteredRoutes = mapData.routes.flatMap(route =>
          (showUpcoming && route.inFuture) ||
          (showCompleted && route.isCompleted)
            ? [
                {
                  ...route,
                  isHover: route.airports.some(
                    ({ id }) => id === hoverAirportId,
                  ),
                  isSelected: route.airports.some(
                    ({ id }) => id === selectedAirportId,
                  ),
                },
              ]
            : [],
        );
        return {
          ...mapData,
          heatmap: filteredHeatmapData,
          routes: filteredRoutes,
          airports: getAirports(filteredRoutes),
          numFlights: filteredRoutes.reduce(
            (acc, { frequency }) => acc + frequency,
            0,
          ),
        };
      },
      staleTime: 5 * 60 * 1000,
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
    if (
      selectedAirportId !== null &&
      data?.airports.every(({ id }) => id !== selectedAirportId) === true
    ) {
      setSelectedAirportId(null);
    }
  }, [data?.airports, selectedAirportId]);
  useEffect(() => {
    if (mapCenterpoint !== undefined) setCenter(mapCenterpoint);
  }, [mapCenterpoint]);
  useTRPCErrorHandler(error);
  return useMemo(
    () => (
      <LoadingCard
        isLoading={isLoading}
        className={classNames(
          'transition-size card-bordered relative min-w-[350px] flex-1 bg-base-200 shadow-md duration-500',
          isMapFullScreen ? 'h-[calc(100vh-148px)]' : 'h-[275px]',
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
            methods={methods}
            selectedAirportId={selectedAirportId}
            setHoverAirportId={setHoverAirportId}
            setSelectedAirportId={setSelectedAirportId}
          />
        ) : null}
        <Form
          className="pointer-events-none absolute flex w-full justify-between gap-2 p-3"
          methods={methods}
        >
          <div className="flex flex-col gap-2">
            {isMapFullScreen ? (
              <div className="pointer-events-auto flex flex-col items-start rounded-xl bg-base-100/70 px-3 py-2">
                <div className="flex flex-row items-center gap-2 sm:gap-4">
                  <Avatar shapeClassName="h-12 w-12 sm:w-16 sm:h-16 rounded-full">
                    <img src={userData?.avatar} alt="User Avatar" />
                  </Avatar>
                  <div className="flex flex-1 flex-col">
                    <div className="text-base font-medium sm:text-xl">{`${
                      userData?.firstName ?? ''
                    } ${userData?.lastName ?? ''}`}</div>
                    <div className="text-xs opacity-75">{`@${
                      userData?.username ?? ''
                    }`}</div>
                    <div className="mt-1 flex gap-4 text-sm">
                      <div className="flex items-center">
                        <Button color="ghost" size="xs" shape="circle">
                          <UserOutlineIcon className="h-3 w-3 text-info" />
                          <span className="sr-only">Following</span>
                        </Button>
                        0
                      </div>
                      <div className="flex items-center">
                        <Button color="ghost" size="xs" shape="circle">
                          <UserSolidIcon className="h-3 w-3 text-info" />
                          <span className="sr-only">Followers</span>
                        </Button>
                        0
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
            <div className="pointer-events-auto flex flex-col items-start rounded-xl bg-base-100/70 px-2">
              <FormCheckbox
                inputClassName="bg-base-200"
                labelText="Show upcoming"
                name="showUpcoming"
              />
              <FormCheckbox
                inputClassName="bg-base-200"
                labelText="Show completed"
                name="showCompleted"
              />
            </div>
            <AirportInfoOverlay
              airportId={selectedAirportId}
              showUpcoming={showUpcoming}
              showCompleted={showCompleted}
            />
          </div>
          <div className="flex gap-2">
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
              menuClassName="right-0 w-full"
              name="mapMode"
            />
            <Button
              className="btn-sm pointer-events-auto px-3 sm:btn-md"
              onClick={() => {
                setIsMapFullScreen(isFullScreen => !isFullScreen);
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
        </Form>
      </LoadingCard>
    ),
    [
      center,
      currentFlight,
      data,
      hoverAirportId,
      isLoading,
      isMapFullScreen,
      mapMode,
      methods,
      showCompleted,
      showUpcoming,
      selectedAirportId,
      setIsMapFullScreen,
      userData,
    ],
  );
};
