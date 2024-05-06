import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { useState } from 'react';
import { Card, CardBody } from 'stratosphere-ui';
import { darkModeStyle } from '../../common/mapStyle';
import { AppTheme, useThemeStore } from '../../stores';

export const DEFAULT_COORDINATES = {
  lat: 0,
  lng: 0,
};

export const FollowingMapCard = (): JSX.Element => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_CLIENT_ID as string,
    libraries: ['visualization'],
  });
  const [center] = useState(DEFAULT_COORDINATES);
  const { theme } = useThemeStore();
  return (
    <Card className="max-w-[1000px] flex-1 bg-base-100">
      <CardBody className="p-0">
        {isLoaded ? (
          <GoogleMap
            mapContainerClassName="rounded-t-box"
            mapContainerStyle={{
              height: '45dvh',
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
  );
};
