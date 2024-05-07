import type { FlightDelayStatus } from './types';

export const APP_URL = import.meta.env.VITE_APP_URL as string;
export const REST_API_URL = `${APP_URL}/rest`;
export const TRPC_API_URL = `${APP_URL}/trpc`;
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const TEXT_COLORS: Record<FlightDelayStatus, string> = {
  none: 'text-success',
  moderate: 'text-warning',
  severe: 'text-error',
};

export const CARD_COLORS: Record<FlightDelayStatus, string> = {
  none: 'bg-success/10',
  moderate: 'bg-warning/20',
  severe: 'bg-error/20',
};

export const CARD_COLORS_LOFI: Record<FlightDelayStatus, string> = {
  none: 'bg-success/5',
  moderate: 'bg-warning/10',
  severe: 'bg-error/10',
};

export const CARD_BORDER_COLORS: Record<FlightDelayStatus, string> = {
  none: 'border-success/25',
  moderate: 'border-warning/50',
  severe: 'border-error/50',
};

export const CARD_BORDER_COLORS_LOFI: Record<FlightDelayStatus, string> = {
  none: 'border-success/50',
  moderate: 'border-warning/75',
  severe: 'border-error/75',
};

export const PROGRESS_BAR_COLORS: Record<FlightDelayStatus, string> = {
  none: 'progress-success',
  moderate: 'progress-warning',
  severe: 'progress-error',
};
