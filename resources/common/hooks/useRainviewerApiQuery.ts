import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import axios, { type AxiosResponse } from 'axios';

interface RadarApiPath {
  time: number;
  path: string;
}

export interface RainviewerApiResult {
  version: string;
  generated: number;
  host: string;
  radar: {
    past: RadarApiPath[];
    nowcast: RadarApiPath[];
  };
  satellite: {
    infrared: RadarApiPath[];
  };
}

export const useRainviewerApiQuery = (): UseQueryResult<
  AxiosResponse<RainviewerApiResult>
> =>
  useQuery(
    ['radarApi'],
    () =>
      axios.get<RainviewerApiResult>(
        'https://api.rainviewer.com/public/weather-maps.json',
      ),
    {
      refetchInterval: 600000,
    },
  );
