import { type Dispatch, type SetStateAction } from 'react';
import { type Control, useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { Button, Card, CardBody, CardTitle, Form } from 'stratosphere-ui';
import { CollapseIcon } from '../../../../common/components';
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
  isStatsFullScreen: boolean;
  setIsStatsFullScreen: Dispatch<SetStateAction<boolean>>;
}

export const StatisticsCard = ({
  filtersFormControl,
  isStatsFullScreen,
  setIsStatsFullScreen,
}: StatisticsProps): JSX.Element => {
  const [, setSearchParams] = useSearchParams();
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
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1">
              <CardTitle>Statistics</CardTitle>
              {!isStatsFullScreen ? (
                <Button
                  className="w-[100px]"
                  color="ghost"
                  onClick={() => {
                    setIsStatsFullScreen(true);
                    setSearchParams(oldSearchParams => ({
                      ...Object.fromEntries(oldSearchParams),
                      isStatsFullScreen: 'true',
                    }));
                  }}
                  size="xs"
                >
                  View All
                </Button>
              ) : null}
            </div>
            {isStatsFullScreen ? (
              <Button
                color="ghost"
                onClick={() => {
                  setIsStatsFullScreen(false);
                  setSearchParams(oldSearchParams => {
                    oldSearchParams.delete('isStatsFullScreen');
                    return oldSearchParams;
                  });
                }}
                size="sm"
              >
                <CollapseIcon className="h-4 w-4" />{' '}
                <span className="hidden sm:inline-block">Collapse</span>
              </Button>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-4">
            <TopAirlinesChart filtersFormControl={filtersFormControl} />
            <TopAircraftTypesChart filtersFormControl={filtersFormControl} />
            <TopAirportsChart filtersFormControl={filtersFormControl} />
            {isStatsFullScreen ? (
              <TopRoutesChart filtersFormControl={filtersFormControl} />
            ) : null}
            <FlightTypePieChart filtersFormControl={filtersFormControl} />
            <FlightLengthRadarChart filtersFormControl={filtersFormControl} />
            <FlightClassRadarChart filtersFormControl={filtersFormControl} />
            {isStatsFullScreen ? (
              <>
                <ReasonRadarChart filtersFormControl={filtersFormControl} />
                <SeatPositionRadarChart
                  filtersFormControl={filtersFormControl}
                />
              </>
            ) : null}
          </div>
        </CardBody>
      </Card>
    </Form>
  );
};
