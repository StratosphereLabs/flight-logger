import { useEffect, useMemo, useState } from 'react';
import { useWatch } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import {
  Form,
  FormCheckbox,
  LoadingCard,
  Select,
  useFormWithQueryParams,
} from 'stratosphere-ui';
import { useTRPCErrorHandler } from '../../common/hooks';
import { trpc } from '../../utils/trpc';
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

export const MapCard = (): JSX.Element => {
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
      showCompleted: showCompleted === 'true',
      mapMode: mapMode as MapCardFormData['mapMode'],
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
  const { data, error, isFetching } = trpc.users.getUserMapData.useQuery(
    {
      username,
    },
    {
      select: mapData => {
        const filteredHeatmapData = mapData.heatmap.flatMap(
          ({ inFuture, lat, lng }) =>
            (showUpcoming || !inFuture) && (showCompleted || inFuture)
              ? [{ lat, lng }]
              : [],
        );
        const filteredRoutes = mapData.routes.flatMap(route =>
          (showUpcoming || !route.inFuture) && (showCompleted || route.inFuture)
            ? [
                {
                  ...route,
                  isHover: [
                    route.departureAirport.id,
                    route.arrivalAirport.id,
                  ].includes(hoverAirportId ?? ''),
                  isSelected: [
                    route.departureAirport.id,
                    route.arrivalAirport.id,
                  ].includes(selectedAirportId ?? ''),
                },
              ]
            : [],
        );
        return {
          ...mapData,
          heatmap: filteredHeatmapData,
          routes: filteredRoutes,
          airports: getAirports(filteredRoutes),
        };
      },
      staleTime: 5 * 60 * 1000,
    },
  );
  useEffect(() => {
    if (data?.centerpoint !== undefined) setCenter(data.centerpoint);
  }, [data?.centerpoint]);
  useTRPCErrorHandler(error);
  return useMemo(
    () => (
      <LoadingCard
        isLoading={isFetching}
        className="card-bordered relative min-h-[450px] min-w-[350px] flex-1 shadow-md"
      >
        {mapMode === 'routes' || mapMode === 'heatmap' ? (
          <GoogleMap
            center={center}
            data={data}
            hoverAirportId={hoverAirportId}
            mapMode={mapMode}
            selectedAirportId={selectedAirportId}
            setSelectedAirportId={setSelectedAirportId}
            setHoverAirportId={setHoverAirportId}
          />
        ) : null}
        {mapMode === '3d' ? (
          <CesiumMap
            center={center}
            data={data}
            hoverAirportId={hoverAirportId}
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
            <div className="pointer-events-auto flex flex-col rounded-xl bg-base-100/70 px-2">
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
            <AirportInfoOverlay airportId={selectedAirportId} />
          </div>
          <Select
            className="pointer-events-auto w-[150px]"
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
        </Form>
      </LoadingCard>
    ),
    [
      center,
      data,
      hoverAirportId,
      isFetching,
      mapMode,
      methods,
      selectedAirportId,
    ],
  );
};
