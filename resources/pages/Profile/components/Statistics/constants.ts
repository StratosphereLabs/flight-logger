import type { StatsTotalsMode } from './types';

export const STATS_TOTALS_MODE_UNITS: Record<StatsTotalsMode, string> = {
  flights: 'flights',
  distance: 'nm',
  duration: 'min',
};

export const BAR_CHART_THEME = {
  text: {
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
  axis: {
    ticks: {
      text: {
        fill: 'var(--fallback-bc,oklch(var(--bc)/0.75))',
        fontFamily:
          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        fontWeight: 600,
      },
    },
  },
  grid: {
    line: {
      stroke: 'var(--fallback-bc,oklch(var(--bc)/0.15))',
      strokeWidth: '2px',
    },
  },
} as const;
