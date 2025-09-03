import { OverlayViewF } from '@react-google-maps/api';
import classNames from 'classnames';

export interface AirportLabelOverlayProps {
  iata: string;
  isFocused: boolean;
  position: google.maps.LatLngLiteral;
  show: boolean;
}

export const AirportLabelOverlay = ({
  iata,
  isFocused,
  position,
  show,
}: AirportLabelOverlayProps): JSX.Element => (
  <OverlayViewF
    getPixelPositionOffset={() => ({
      x: -20,
      y: -30,
    })}
    mapPaneName="overlayLayer"
    position={position}
    zIndex={30}
  >
    <div
      className={classNames(
        'rounded-box bg-base-100 bg-opacity-60 border-base-200 border-2 px-[5px] font-mono text-sm font-bold backdrop-blur-xs transition-opacity',
        show ? !isFocused && 'opacity-10' : 'opacity-0',
      )}
    >
      {iata}
    </div>
  </OverlayViewF>
);
