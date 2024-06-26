import { Cartesian3, Color, type Viewer as ViewerType } from 'cesium';
import { useRef, type Dispatch, type SetStateAction, useEffect } from 'react';
import { type UseFormReturn, useWatch } from 'react-hook-form';
import { type CesiumComponentRef, Entity, Viewer } from 'resium';
import planeIconUrl from '../../../../assets/plane.svg';
import { type MapCardFormData } from './MapCard';
import type { FilteredMapData, MapCoords, MapFlight } from './types';

export interface CesiumMapProps {
  center: MapCoords;
  currentFlight?: MapFlight;
  data: FilteredMapData;
  hoverAirportId: string | null;
  methods: UseFormReturn<MapCardFormData>;
  selectedAirportId: string | null;
  setHoverAirportId: Dispatch<SetStateAction<string | null>>;
  setSelectedAirportId: Dispatch<SetStateAction<string | null>>;
}

export const CesiumMap = ({
  center,
  currentFlight,
  data,
  hoverAirportId,
  methods,
  selectedAirportId,
  setSelectedAirportId,
  setHoverAirportId,
}: CesiumMapProps): JSX.Element => {
  const viewerRef = useRef<CesiumComponentRef<ViewerType> | null>(null);
  const [showCompleted, showUpcoming] = useWatch<
    MapCardFormData,
    ['mapShowCompleted', 'mapShowUpcoming']
  >({
    control: methods.control,
    name: ['mapShowCompleted', 'mapShowUpcoming'],
  });
  useEffect(() => {
    viewerRef.current?.cesiumElement?.camera.setView({
      destination: Cartesian3.fromDegrees(center.lng, center.lat, 10000000),
    });
  }, [center]);
  return (
    <Viewer
      ref={viewerRef}
      animation={false}
      baseLayerPicker={false}
      className="h-full w-full"
      fullscreenButton={false}
      geocoder={false}
      homeButton={false}
      navigationHelpButton={false}
      onClick={() => {
        if (selectedAirportId !== null) {
          setSelectedAirportId(null);
        }
      }}
      resolutionScale={2}
      scene3DOnly
      style={{
        borderRadius: '1rem',
      }}
      timeline={false}
    >
      {data.routes?.map(
        ({ airports, inFuture, isCompleted, isHover, isSelected }, index) => {
          const isActive = isSelected || isHover;
          return (
            <Entity
              key={index}
              polyline={{
                clampToGround: true,
                material: Color.fromAlpha(
                  isActive
                    ? Color.BLUE
                    : isCompleted && (!showUpcoming || showCompleted)
                      ? Color.RED
                      : Color.WHITE,
                  selectedAirportId === null || isSelected ? 0.75 : 0.1,
                ),
                positions: [
                  Cartesian3.fromDegrees(airports[0].lon, airports[0].lat, 0),
                  Cartesian3.fromDegrees(airports[1].lon, airports[1].lat, 0),
                ],
                width: isActive ? 3 : 1.5,
                zIndex: isActive ? 10 : inFuture ? 5 : undefined,
              }}
            />
          );
        },
      )}
      {data.airports?.map(({ id, lat, lon, hasSelectedRoute }) => {
        const isActive = selectedAirportId === id || hoverAirportId === id;
        return (
          <Entity
            key={id}
            onClick={() => {
              setSelectedAirportId(id);
            }}
            onMouseEnter={() => {
              setHoverAirportId(id);
            }}
            onMouseLeave={() => {
              setHoverAirportId(null);
            }}
            position={Cartesian3.fromDegrees(lon, lat, 10)}
            point={{
              color: Color.fromAlpha(
                isActive ? Color.YELLOW : Color.WHITE,
                hasSelectedRoute || selectedAirportId === null ? 1 : 0.2,
              ),
              outlineColor: Color.fromAlpha(
                Color.BLACK,
                hasSelectedRoute || selectedAirportId === null ? 1 : 0.2,
              ),
              outlineWidth: isActive ? 1.5 : 1,
              pixelSize: isActive ? 6 : 5,
            }}
          />
        );
      })}
      {currentFlight !== undefined ? (
        <Entity
          position={Cartesian3.fromDegrees(
            currentFlight.lng,
            currentFlight.lat,
            1000,
          )}
          billboard={{
            image: planeIconUrl,
            scale: 0.15,
            rotation: -(currentFlight.heading - 90) * (Math.PI / 180),
          }}
        />
      ) : null}
    </Viewer>
  );
};
