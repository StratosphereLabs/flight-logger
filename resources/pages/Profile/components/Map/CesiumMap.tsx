import { Cartesian3, Color, type Viewer as ViewerType } from 'cesium';
import { type Dispatch, type SetStateAction, useEffect, useRef } from 'react';
import { type CesiumComponentRef, Entity, Viewer } from 'resium';

import planeIconUrl from '../../../../assets/plane.svg';
import { useAddFlightStore } from '../Flights/addFlightStore';
import type { FilteredMapData, MapFlight } from './types';

export interface CesiumMapProps {
  center: google.maps.LatLngLiteral;
  currentFlight?: MapFlight;
  data: FilteredMapData;
  hoverAirportId: string | null;
  selectedAirportId: string | null;
  setHoverAirportId: Dispatch<SetStateAction<string | null>>;
  setSelectedAirportId: (newId: string | null) => void;
}

export const CesiumMap = ({
  center,
  currentFlight,
  data,
  hoverAirportId,
  selectedAirportId,
  setSelectedAirportId,
  setHoverAirportId,
}: CesiumMapProps): JSX.Element => {
  const { isAddingFlight } = useAddFlightStore();
  const viewerRef = useRef<CesiumComponentRef<ViewerType> | null>(null);
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
      timeline={false}
    >
      {!isAddingFlight &&
        data.routes?.map(({ airports, isCompleted, isSelected }, index) => {
          const isHover = airports.some(({ id }) => id === hoverAirportId);
          const isActive = isSelected || isHover;
          return (
            <Entity
              key={index}
              polyline={{
                clampToGround: true,
                material: Color.fromAlpha(
                  isActive || isCompleted ? Color.RED : Color.WHITE,
                  selectedAirportId === null || isSelected ? 0.75 : 0.1,
                ),
                positions: [
                  Cartesian3.fromDegrees(airports[0].lon, airports[0].lat, 0),
                  Cartesian3.fromDegrees(airports[1].lon, airports[1].lat, 0),
                ],
                width: isActive ? 3 : 2,
                zIndex: isActive ? 10 : !isCompleted ? 5 : undefined,
              }}
            />
          );
        })}
      {!isAddingFlight &&
        data.airports?.map(({ id, lat, lon, hasSelectedRoute }) => {
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
                  hasSelectedRoute || selectedAirportId === null ? 1 : 0.1,
                ),
                outlineColor: Color.fromAlpha(
                  Color.BLACK,
                  hasSelectedRoute || selectedAirportId === null ? 1 : 0.1,
                ),
                outlineWidth: isActive ? 1.5 : 1,
                pixelSize: isActive ? 5 : 4,
              }}
            />
          );
        })}
      {!isAddingFlight && currentFlight !== undefined ? (
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
