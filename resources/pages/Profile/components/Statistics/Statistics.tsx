import { type Control, useForm } from 'react-hook-form';
import { Card, CardBody, CardTitle, Form } from 'stratosphere-ui';
import { type ProfileFilterFormData } from '../../hooks';
import { FlightClassRadarChart } from './FlightClassRadarChart';
import { FlightLengthRadarChart } from './FlightLengthRadarChart';
import { FlightTypePieChart } from './FlightTypePieChart';
import { ReasonRadarChart } from './ReasonRadarChart';
import { SeatPositionRadarChart } from './SeatPositionRadarChart';
import { TopAirlinesChart } from './TopAirlinesChart';
import { TopAircraftTypesChart } from './TopAircraftTypesChart';
import { TopAirportsChart } from './TopAirportsChart';
import { TopRoutesChart } from './TopRoutesChart';
import type { StatsAirportMode, StatsTotalsMode } from './types';

export interface StatisticsFiltersData {
  airlinesMode: StatsTotalsMode;
  aircraftTypesMode: StatsTotalsMode;
  airportsMode: StatsAirportMode;
  routesCityPairs: boolean;
  flightTypeMode: StatsTotalsMode;
  flightLengthMode: StatsTotalsMode;
  flightReasonMode: StatsTotalsMode;
  flightClassMode: StatsTotalsMode;
  seatPositionMode: StatsTotalsMode;
}

export interface StatisticsProps {
  filtersFormControl: Control<ProfileFilterFormData>;
}

export const Statistics = ({
  filtersFormControl,
}: StatisticsProps): JSX.Element => {
  const methods = useForm<StatisticsFiltersData>({
    defaultValues: {
      airlinesMode: 'flights',
      aircraftTypesMode: 'flights',
      airportsMode: 'all',
      routesCityPairs: false,
      flightTypeMode: 'flights',
      flightLengthMode: 'flights',
      flightReasonMode: 'flights',
      flightClassMode: 'flights',
      seatPositionMode: 'flights',
    },
  });
  return (
    <Form methods={methods} className="flex flex-1 flex-col">
      <Card className="flex-1 bg-base-100 shadow-sm" compact>
        <CardBody className="gap-4">
          <CardTitle>Statistics</CardTitle>
          <div className="flex flex-wrap gap-x-6 gap-y-4">
            <TopAirlinesChart filtersFormControl={filtersFormControl} />
            <TopAircraftTypesChart filtersFormControl={filtersFormControl} />
            <TopAirportsChart filtersFormControl={filtersFormControl} />
            <TopRoutesChart filtersFormControl={filtersFormControl} />
            <FlightTypePieChart filtersFormControl={filtersFormControl} />
            <FlightLengthRadarChart filtersFormControl={filtersFormControl} />
            <ReasonRadarChart filtersFormControl={filtersFormControl} />
            <FlightClassRadarChart filtersFormControl={filtersFormControl} />
            <SeatPositionRadarChart filtersFormControl={filtersFormControl} />
          </div>
        </CardBody>
      </Card>
    </Form>
  );
};
