export type StatsTotalsMode = 'flights' | 'distance' | 'duration';

export type StatsAirportMode = 'all' | 'departure' | 'arrival';

export interface TotalsModeFormData {
  mode: StatsTotalsMode;
}

export interface AirportsModeFormData {
  mode: StatsAirportMode;
}
