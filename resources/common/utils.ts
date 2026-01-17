import { type PaginationState, type SortingState } from '@tanstack/react-table';

export const getPaginationQueryString = ({
  pageIndex,
  pageSize,
}: PaginationState): string => {
  const page = pageIndex !== undefined ? pageIndex + 1 : 1;
  const limit = pageSize ?? 10;
  return `page=${page}&limit=${limit}`;
};

export const getSortingQueryString = (sorting: SortingState): string =>
  sorting.length > 0
    ? `sortKey=${sorting[0].id ?? ''}&sort=${sorting[0].desc ? 'desc' : 'asc'}`
    : '';

export const generateUUID = (): string => {
  const randomBytes = crypto.getRandomValues(new Uint8Array(16));
  randomBytes[6] = (randomBytes[6] & 0x0f) | 0x40;
  randomBytes[8] = (randomBytes[8] & 0x3f) | 0x80;
  const uuidArray = new Array(36);
  let i = 0;
  let j = 0;
  for (; i < 16; i++) {
    if (i === 4 || i === 6 || i === 8 || i === 10) {
      uuidArray[j++] = '-';
    }
    const hex = randomBytes[i].toString(16);
    uuidArray[j++] = hex.length === 1 ? '0' + hex : hex;
  }
  return uuidArray.join('');
};

export const getLongDurationString = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  let durationString = '';
  if (hours > 0) {
    durationString += `${hours.toLocaleString()}h `;
  }
  if (mins > 0 || durationString === '') {
    durationString += `${mins.toLocaleString()}m`;
  }
  return durationString.trim();
};

export const extendBounds = (
  bounds: google.maps.LatLngBounds,
  lat: number,
  lng: number,
): void => {
  bounds.extend(new window.google.maps.LatLng({ lat, lng }));
};
