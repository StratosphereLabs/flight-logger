import { OverlayViewF } from '@react-google-maps/api';
import classNames from 'classnames';

import { useIsDarkMode } from '../../stores';

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
}: AirportLabelOverlayProps): JSX.Element => {
  const isDarkMode = useIsDarkMode();
  return (
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
          'rounded-box border-primary border-2 px-[5px] font-mono text-sm font-bold backdrop-blur-xs transition-opacity',
          show ? !isFocused && 'opacity-10' : 'opacity-0',
          isDarkMode ? 'bg-primary/40' : 'bg-primary/65 text-white',
        )}
      >
        {iata}
      </div>
    </OverlayViewF>
  );
};
