import { type Control } from 'react-hook-form';

import { type ProfileFilterFormData } from '../../hooks';

export type StatsTotalsMode = 'flights' | 'distance' | 'duration';

export type StatsAirportMode = 'all' | 'departure' | 'arrival';

export interface StatisticsChartProps {
  filtersFormControl: Control<ProfileFilterFormData>;
  selectedAirportId: string | null;
}
