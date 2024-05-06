import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { useState } from 'react';
import { Card, CardBody, CardTitle } from 'stratosphere-ui';
import { darkModeStyle } from '../../common/mapStyle';
import {
  AppTheme,
  getIsLoggedIn,
  useAuthStore,
  useThemeStore,
} from '../../stores';
import { WelcomeHero } from './WelcomeHero';

export const DEFAULT_COORDINATES = {
  lat: 0,
  lng: 0,
};

export const Home = (): JSX.Element => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_CLIENT_ID as string,
    libraries: ['visualization'],
  });
  const isLoggedIn = useAuthStore(getIsLoggedIn);
  const [center] = useState(DEFAULT_COORDINATES);
  const { theme } = useThemeStore();
  return isLoggedIn ? (
    <div className="flex flex-1 justify-center p-3">
      <Card className="max-w-[1000px] flex-1 bg-base-100">
        <CardBody className="p-0">
          <CardTitle className="justify-center py-3">Live Map</CardTitle>
          {isLoaded ? (
            <GoogleMap
              mapContainerClassName="rounded-b-box"
              mapContainerStyle={{
                height: '100%',
                width: '100%',
              }}
              zoom={3}
              options={{
                center,
                minZoom: 2,
                fullscreenControl: false,
                mapTypeControl: false,
                zoomControl: false,
                streetViewControl: false,
                gestureHandling: 'greedy',
                styles:
                  theme === AppTheme.DARK ||
                  theme === AppTheme.NIGHT ||
                  theme === AppTheme.SUNSET
                    ? darkModeStyle
                    : undefined,
              }}
            />
          ) : null}
        </CardBody>
      </Card>
    </div>
  ) : (
    <div className="flex flex-1 flex-col items-center justify-center">
      <WelcomeHero />
    </div>
  );
};
