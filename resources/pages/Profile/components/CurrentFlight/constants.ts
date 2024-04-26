import type { FlightDelayStatus } from '../../types';

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

export const CARD_COLORS_LOFI: Record<FlightDelayStatus, string> = {
  none: 'bg-success/5',
  moderate: 'bg-warning/5',
  severe: 'bg-error/5',
};

export const CARD_BORDER_COLORS: Record<FlightDelayStatus, string> = {
  none: 'border-success/25',
  moderate: 'border-warning/25',
  severe: 'border-error/25',
};

export const CARD_BORDER_COLORS_LOFI: Record<FlightDelayStatus, string> = {
  none: 'border-success/50',
  moderate: 'border-warning/50',
  severe: 'border-error/50',
};

export const PROGRESS_BAR_COLORS: Record<FlightDelayStatus, string> = {
  none: 'progress-success',
  moderate: 'progress-warning',
  severe: 'progress-error',
};
