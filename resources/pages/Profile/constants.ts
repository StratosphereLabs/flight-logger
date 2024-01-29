import { format } from 'date-fns';
import { DATE_FORMAT_ISO } from '../../../app/constants';
import { type FetchFlightsByFlightNumberRequest } from '../../../app/schemas';
import { type FlightDelayStatus } from './utils';

export const DEFAULT_COORDINATES = {
  lat: 0,
  lng: 0,
};

export const TEXT_COLORS: Record<FlightDelayStatus, string> = {
  none: 'text-success',
  moderate: 'text-warning',
  severe: 'text-error',
};

export const CARD_COLORS: Record<FlightDelayStatus, string> = {
  none: 'bg-success/10',
  moderate: 'bg-warning/10',
  severe: 'bg-error/10',
};

export const CARD_BORDER_COLORS: Record<FlightDelayStatus, string> = {
  none: 'border-success/20',
  moderate: 'border-warning/20',
  severe: 'border-error/20',
};

export const PROGRESS_BAR_COLORS: Record<FlightDelayStatus, string> = {
  none: 'progress-success',
  moderate: 'progress-warning',
  severe: 'progress-error',
};

export const flightSearchFormDefaultValues: FetchFlightsByFlightNumberRequest =
  {
    outDateISO: format(new Date(), DATE_FORMAT_ISO),
    airline: null,
    flightNumber: null,
  };
