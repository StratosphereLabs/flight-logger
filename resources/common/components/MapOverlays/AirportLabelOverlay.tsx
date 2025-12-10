import { OverlayViewF } from '@react-google-maps/api';
import classNames from 'classnames';

import { useIsDarkMode } from '../../../stores';

export interface AirportLabelOverlayProps {
  distanceMi?: number;
  iata: string;
  isFocused: boolean;
  position: google.maps.LatLngLiteral;
  show: boolean;
}

export const AirportLabelOverlay = ({
  distanceMi,
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
          'rounded-box flex items-center gap-2 border-2 px-[5px] font-mono text-sm font-bold backdrop-blur-xs transition-opacity',
          show ? !isFocused && 'opacity-10' : 'opacity-0',
          isDarkMode
            ? 'bg-base-100/50 text-base-content border-base-100'
            : 'bg-primary/70 text-primary-content border-primary',
        )}
      >
        {iata}
        {distanceMi !== undefined ? (
          <div className="flex gap-1 text-xs opacity-80">
            {distanceMi.toLocaleString()}
            <span>mi</span>
          </div>
        ) : null}
      </div>
    </OverlayViewF>
  );
};
