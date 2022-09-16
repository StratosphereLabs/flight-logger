import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
} from 'react-leaflet';
import { Card } from '../../common/components';
import { useFlightsQuery } from '../../common/hooks';

export const MapCard = (): JSX.Element => {
  const { isLoading, airportsList, routesList } =
    useFlightsQuery('EchoSierra98');
  return (
    <Card isLoading={isLoading} className="shadow flex-1 bg-base-200">
      <MapContainer className="h-full w-full" center={[51.505, -0.09]} zoom={8}>
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
          <Polyline
            key={index}
            positions={[
              [departureAirport.lat, departureAirport.lon],
              [arrivalAirport.lat, arrivalAirport.lon],
            ]}
          />
        ))}
      </MapContainer>
    </Card>
  );
};
