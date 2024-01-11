import { Cartesian3, Color, type Viewer as ViewerType } from 'cesium';
import { useRef, type Dispatch, type SetStateAction, useEffect } from 'react';
import { type CesiumComponentRef, Entity, Viewer } from 'resium';
import { type FilteredMapData, type MapCoords } from './utils';

export interface CesiumMapProps {
  center: MapCoords;
  data: FilteredMapData;
  hoverAirportId: string | null;
  selectedAirportId: string | null;
  setHoverAirportId: Dispatch<SetStateAction<string | null>>;
  setSelectedAirportId: Dispatch<SetStateAction<string | null>>;
}

export const CesiumMap = ({
  center,
  data,
  hoverAirportId,
  selectedAirportId,
  setSelectedAirportId,
  setHoverAirportId,
}: CesiumMapProps): JSX.Element => {
  const viewerRef = useRef<CesiumComponentRef<ViewerType> | null>(null);
  useEffect(() => {
    viewerRef.current?.cesiumElement?.camera.setView({
      destination: Cartesian3.fromDegrees(center.lng, center.lat, 0),
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
      scene3DOnly
      style={{
        borderRadius: '1rem',
      }}
      timeline={false}
    >
      {data.routes?.map(
        (
          { departureAirport, arrivalAirport, inFuture, isHover, isSelected },
          index,
        ) => {
          const isActive = isSelected || isHover;
          return (
            <Entity
              key={index}
              polyline={{
                width: isActive ? 3 : 1.5,
                material: Color.fromAlpha(
                  isActive ? Color.BLUE : inFuture ? Color.WHITE : Color.RED,
                  selectedAirportId === null || isSelected ? 0.5 : 0.1,
                ),
                positions: [
                  Cartesian3.fromDegrees(
                    departureAirport.lon,
                    departureAirport.lat,
                    0,
                  ),
                  Cartesian3.fromDegrees(
                    arrivalAirport.lon,
                    arrivalAirport.lat,
                    0,
                  ),
                ],
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
            position={Cartesian3.fromDegrees(lon, lat, 100)}
            point={{
              color: Color.fromAlpha(
                isActive ? Color.YELLOW : Color.WHITE,
                hasSelectedRoute || selectedAirportId === null ? 1 : 0.2,
              ),
              outlineColor: Color.fromAlpha(
                Color.BLACK,
                hasSelectedRoute || selectedAirportId === null ? 1 : 0.2,
              ),
              outlineWidth: 1.5,
              pixelSize: 6,
            }}
          />
        );
      })}
    </Viewer>
  );
};
