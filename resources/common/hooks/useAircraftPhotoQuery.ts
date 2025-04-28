import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import axios from 'axios';

export interface AircraftThumbnail {
  src: string;
  size: {
    width: number;
    height: number;
  };
}

export interface AircraftPhotoResponse {
  photos: Array<{
    id: string;
    thumbnail: AircraftThumbnail;
    thumbnail_large: AircraftThumbnail;
    link: string;
    photographer: string;
  }>;
}

export const useAircraftPhotoQuery = (
  airframeId: string | null,
): UseQueryResult<AircraftPhotoResponse> =>
  useQuery(
    ['aircraftPhoto', airframeId],
    async () => {
      const result = await axios.get<AircraftPhotoResponse>(
        `https://api.planespotters.net/pub/photos/hex/${airframeId}`,
      );
      return result.data;
    },
    { enabled: airframeId !== null },
  );
