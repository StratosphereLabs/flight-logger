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

export const CARD_COLORS_HOVER: Record<FlightDelayStatus, string> = {
  none: 'hover:bg-success/20 xl:hover:bg-success/10',
  moderate: 'hover:bg-warning/25 xl:hover:bg-warning/15',
  severe: 'hover:bg-error/25 xl:hover:bg-error/15',
  canceled: 'hover:bg-error/25 xl:hover:bg-error/15',
};

export const CARD_BORDER_COLORS: Record<FlightDelayStatus, string> = {
  none: 'border-success/25',
  moderate: 'border-warning/50',
  severe: 'border-error/50',
  canceled: 'border-error/50',
};

export const TOOLTIP_COLORS: Record<FlightDelayStatus, TooltipColor> = {
  none: 'success',
  moderate: 'warning',
  severe: 'error',
  canceled: 'error',
};

export const CHRISTMAS_THEME_TOOLTIP_COLORS: Record<FlightDelayStatus, string> =
  {
    none: '[--tt-bg:var(--color-success-dark)]',
    moderate: '[--tt-bg:var(--color-warning-dark)]',
    severe: '[--tt-bg:var(--color-error-dark)]',
    canceled: '[--tt-bg:var(--color-error-dark)]',
  };

export const PROGRESS_BAR_COLORS: Record<FlightDelayStatus, string> = {
  none: 'progress-success',
  moderate: 'progress-warning',
  severe: 'progress-error',
  canceled: 'progress-error',
};

export const DEBOUNCE_DEFAULT_DELAY = 400;

export const HIDE_SCROLLBAR_CLASSNAME =
  '[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';

export const BAR_CHART_THEME = {
  text: {
    fontSize: '12px',
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
  axis: {
    ticks: {
      text: {
        fill: 'oklch(from var(--color-base-content) l c h / 0.75)',
        fontFamily:
          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        fontWeight: 600,
      },
    },
    legend: {
      text: {
        fill: 'oklch(from var(--color-base-content) l c h / 0.60)',
        fontFamily:
          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        fontWeight: 500,
        fontSize: 13,
      },
    },
  },
  grid: {
    line: {
      stroke: 'oklch(from var(--color-base-content) l c h / 0.15)',
      strokeWidth: '2px',
    },
  },
} as const;
