export type StatsTotalsMode = 'flights' | 'distance' | 'duration';

export type StatsAirportMode = 'all' | 'departure' | 'arrival';

export interface StatisticsChartProps {
  selectedAirportId: string | null;
}
