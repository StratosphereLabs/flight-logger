import { MarkerF } from '@react-google-maps/api';

import { type FlightsRouterOutput } from '../../../../app/routes/flights';
import { AirportLabelOverlay } from './AirportLabelOverlay';

interface AirportMarkersProps {
  airports: Array<
    Pick<
      FlightsRouterOutput['getFlight']['departureAirport'],
      'id' | 'lat' | 'lon' | 'iata' | 'estimatedDistance'
    >
  >;
  showDistance?: boolean;
}

export const AirportMarkersOverlay = ({
  airports,
  showDistance,
}: AirportMarkersProps): JSX.Element => (
  <>
    {airports.map(({ id, lat, lon, iata, estimatedDistance }) => (
      <div key={id}>
        <AirportLabelOverlay
          iata={iata}
          isFocused
          position={{ lat, lng: lon }}
          show
          distanceMi={showDistance === true ? estimatedDistance : undefined}
        />
        <MarkerF
          position={{ lat, lng: lon }}
          title={id}
          options={{
            icon:
              window.google !== undefined
                ? {
                    path: window.google.maps.SymbolPath.CIRCLE,
                    fillColor: 'white',
                    fillOpacity: 1,
                    scale: 4,
                    strokeColor: 'black',
                    strokeWeight: 2,
                    strokeOpacity: 1,
                  }
                : null,
            zIndex: 30,
          }}
        />
      </div>
    ))}
  </>
);
