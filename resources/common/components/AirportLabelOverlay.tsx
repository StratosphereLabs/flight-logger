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
      x: -16,
      y: -26,
    })}
    mapPaneName="overlayLayer"
    position={position}
    zIndex={30}
  >
    <div
      className={classNames(
        'rounded-box bg-base-100 bg-opacity-60 px-[4px] font-mono text-sm backdrop-blur-sm transition-opacity',
        'font-bold',
        show ? !isFocused && 'opacity-10' : 'opacity-0',
      )}
    >
      {iata}
    </div>
  </OverlayViewF>
);
