import type { StatsTotalsMode } from './types';

export const STATS_TOTALS_MODE_UNITS: Record<StatsTotalsMode, string> = {
  flights: 'flights',
  distance: 'mi',
  duration: 'min',
};

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
  },
  grid: {
    line: {
      stroke: 'oklch(from var(--color-base-content) l c h / 0.15)',
      strokeWidth: '2px',
    },
  },
} as const;
