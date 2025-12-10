import { useJsApiLoader } from '@react-google-maps/api';
import { type Dispatch, type SetStateAction, useEffect, useState } from 'react';

import { DEFAULT_COORDINATES } from '../../pages/Home/constants';
import { AppTheme, useIsDarkMode, useThemeStore } from '../../stores';
import {
  christmasStyle,
  cyberPunkStyle,
  darkModeStyle,
  lightModeStyle,
} from '../mapStyle';

export interface UseGoogleMapInitializationResult {
  isLoaded: boolean;
  map: google.maps.Map | null;
  setCenter: Dispatch<SetStateAction<google.maps.LatLngLiteral>>;
  setMap: Dispatch<SetStateAction<google.maps.Map | null>>;
}

export const useGoogleMapInitialization =
  (): UseGoogleMapInitializationResult => {
    const { isLoaded } = useJsApiLoader({
      googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_CLIENT_ID as string,
      libraries: ['visualization'],
    });
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [center, setCenter] = useState(DEFAULT_COORDINATES);
    const isDarkMode = useIsDarkMode();
    const { theme } = useThemeStore();
    useEffect(() => {
      map?.setValues({
        styles:
          theme === AppTheme.CYBERPUNK
            ? cyberPunkStyle
            : theme === AppTheme.CHRISTMAS
              ? christmasStyle
              : isDarkMode
                ? darkModeStyle
                : lightModeStyle,
      });
    }, [isDarkMode, map, theme]);
    useEffect(() => {
      map?.setCenter(center);
    }, [center, map]);
    return {
      isLoaded,
      map,
      setCenter,
      setMap,
    };
  };
