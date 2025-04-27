import { type TooltipColor } from 'stratosphere-ui';

import type { FlightDelayStatus } from './types';

export const APP_URL = import.meta.env.VITE_APP_URL as string;
export const REST_API_URL = `${APP_URL}/rest`;
export const TRPC_API_URL = `${APP_URL}/trpc`;
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;

export const TIME_FORMAT_12H = 'h:mm aaa';
export const DATE_FORMAT = 'MMM d, yyyy';

export const DEFAULT_PAGE_SIZE = 20;

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
  canceled: 'text-error',
};

export const CARD_COLORS: Record<FlightDelayStatus, string> = {
  none: 'bg-success/10',
  moderate: 'bg-warning/15',
  severe: 'bg-error/15',
  canceled: 'bg-error/15',
};

export const CARD_COLORS_LOFI: Record<FlightDelayStatus, string> = {
  none: 'bg-success/25',
  moderate: 'bg-warning/25',
  severe: 'bg-error/25',
  canceled: 'bg-error/25',
};

export const CARD_BORDER_COLORS: Record<FlightDelayStatus, string> = {
  none: 'border-success/25',
  moderate: 'border-warning/50',
  severe: 'border-error/50',
  canceled: 'border-error/50',
};

export const CARD_BORDER_COLORS_LOFI: Record<FlightDelayStatus, string> = {
  none: 'border-success/75',
  moderate: 'border-warning/75',
  severe: 'border-error/75',
  canceled: 'border-error/75',
};

export const TOOLTIP_COLORS: Record<FlightDelayStatus, TooltipColor> = {
  none: 'success',
  moderate: 'warning',
  severe: 'error',
  canceled: 'error',
};

export const PROGRESS_BAR_COLORS: Record<FlightDelayStatus, string> = {
  none: 'progress-success',
  moderate: 'progress-warning',
  severe: 'progress-error',
  canceled: 'progress-error',
};
