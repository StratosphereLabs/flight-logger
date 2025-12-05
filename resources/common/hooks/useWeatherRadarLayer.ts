import { type UseQueryResult } from '@tanstack/react-query';
import { type AxiosResponse } from 'axios';
import { useEffect } from 'react';

import {
  type RainviewerApiResult,
  useRainviewerApiQuery,
} from './useRainviewerApiQuery';

export const useWeatherRadarLayer = (
  map: google.maps.Map | null,
  timestamp?: number | null,
): UseQueryResult<AxiosResponse<RainviewerApiResult>> => {
  const queryResult = useRainviewerApiQuery();
  useEffect(() => {
    if (
      map !== null &&
      timestamp !== null &&
      queryResult.data !== undefined &&
      map.overlayMapTypes.getLength() < 2
    ) {
      const weatherRadarMapType = new google.maps.ImageMapType({
        getTileUrl: (coord, zoom) => {
          const { past } = queryResult.data.data.radar;
          const path =
            timestamp !== undefined
              ? `/v2/radar/${timestamp}`
              : past[past.length - 1].path;
          return `https://cdn.rainviewer.com${path}/256/${zoom}/${coord.x}/${coord.y}/2/1_1.png`;
        },
        tileSize: new google.maps.Size(256, 256),
        maxZoom: 9,
        minZoom: 0,
        name: 'Weather Radar',
        opacity: 0.25,
      });
      map.overlayMapTypes.clear();
      map.overlayMapTypes.push(weatherRadarMapType);
    }
  }, [map, queryResult.data, timestamp]);
  return queryResult;
};
