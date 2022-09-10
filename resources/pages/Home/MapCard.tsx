import { Card } from 'react-daisyui';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';

export const MapCard = (): JSX.Element => (
  <Card className="shadow flex-1 min-w-max">
    <MapContainer className="h-full w-full" center={[51.505, -0.09]} zoom={13}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        className="map-tiles"
      />
      <Marker position={[51.505, -0.09]}>
        <Popup>
          A pretty CSS3 popup. <br /> Easily customizable.
        </Popup>
      </Marker>
    </MapContainer>
  </Card>
);
