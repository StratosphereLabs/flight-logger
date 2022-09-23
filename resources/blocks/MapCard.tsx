import { useLeafletContext } from '@react-leaflet/core';
import { LatLngExpression } from 'leaflet';
import { GeodesicLine } from 'leaflet.geodesic';
import { useEffect } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { LoadingCard } from '../common/components';
import { useFlightsQuery } from '../common/hooks';

export interface FlightPathProps {
  paths: LatLngExpression[] | LatLngExpression[][];
}

export const FlightPath = ({ paths }: FlightPathProps): null => {
  const context = useLeafletContext();
  useEffect(() => {
    const line = new GeodesicLine(paths, { wrap: false });
    const container = context.layerContainer ?? context.map;
    container.addLayer(line);
    return () => {
      container.removeLayer(line);
    };
  }, []);
  return null;
};

export const MapCard = (): JSX.Element => {
  const { isLoading, airportsList, routesList } = useFlightsQuery();
  return (
    <LoadingCard
      isLoading={isLoading}
      className="shadow flex-1 bg-base-200 min-h-[400px] min-w-[500px]"
    >
      <MapContainer
        className="h-full w-full"
        boundsOptions={{}}
        center={[38, -120]}
        zoom={4}
        worldCopyJump={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles"
        />
        {airportsList?.map(({ id, lat, lon }) => (
          <Marker key={id} position={[lat, lon]}>
            <Popup>{id}</Popup>
          </Marker>
        ))}
        {routesList?.map(({ departureAirport, arrivalAirport }, index) => (
          <FlightPath
            key={index}
            paths={[
              [departureAirport.lat, departureAirport.lon],
              [arrivalAirport.lat, arrivalAirport.lon],
            ]}
          />
        ))}
      </MapContainer>
    </LoadingCard>
  );
};
