import { type Dispatch, type SetStateAction } from 'react';
import { type Control, useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { Button, Card, CardBody, CardTitle, Form } from 'stratosphere-ui';

import { CollapseIcon, ExpandIcon } from '../../../../common/components';
import { type ProfileFilterFormData } from '../../hooks';
import { FlightClassRadarChart } from './FlightClassRadarChart';
import { FlightLengthRadarChart } from './FlightLengthRadarChart';
import { FlightTypePieChart } from './FlightTypePieChart';
import { ReasonRadarChart } from './ReasonRadarChart';
import { SeatPositionRadarChart } from './SeatPositionRadarChart';
import { TopAircraftTypesChart } from './TopAircraftTypesChart';
import { TopAirlinesChart } from './TopAirlinesChart';
import { TopAirportsChart } from './TopAirportsChart';
import { TopCountriesChart } from './TopCountriesChart';
import { TopRegionsChart } from './TopRegionsChart';
import { TopRoutesChart } from './TopRoutesChart';
import { TotalsChart } from './TotalsChart';
import type { StatsAirportMode, StatsTotalsMode } from './types';

export interface StatisticsFiltersData {
  airlinesMode: StatsTotalsMode;
  aircraftTypesMode: StatsTotalsMode;
  airportsMode: StatsAirportMode;
  countriesMode: StatsAirportMode;
  regionsMode: StatsAirportMode;
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
  selectedAirportId: string | null;
  setIsStatsFullScreen: Dispatch<SetStateAction<boolean>>;
}

export const StatisticsCard = ({
  filtersFormControl,
  isStatsFullScreen,
  selectedAirportId,
  setIsStatsFullScreen,
}: StatisticsProps): JSX.Element => {
  const [, setSearchParams] = useSearchParams();
  const methods = useForm<StatisticsFiltersData>({
    defaultValues: {
      airlinesMode: 'flights',
      aircraftTypesMode: 'flights',
      airportsMode: 'all',
      countriesMode: 'all',
      regionsMode: 'all',
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
      <Card className="bg-base-100 flex-1 shadow-xs">
        <CardBody className="p-4">
          <div className="flex items-start justify-between gap-2">
            <CardTitle>Statistics</CardTitle>
            <Button
              onClick={() => {
                setSearchParams(oldSearchParams => {
                  if (isStatsFullScreen) {
                    oldSearchParams.delete('isStatsFullScreen');
                    return oldSearchParams;
                  }
                  return {
                    ...Object.fromEntries(oldSearchParams),
                    isStatsFullScreen: 'true',
                  };
                });
                setIsStatsFullScreen(isFullScreen => !isFullScreen);
              }}
              size="sm"
              soft
            >
              {isStatsFullScreen ? (
                <CollapseIcon className="h-4 w-4" />
              ) : (
                <ExpandIcon className="h-4 w-4" />
              )}
              <span>{isStatsFullScreen ? 'Collapse' : 'View All'}</span>
            </Button>
          </div>
          <TotalsChart
            filtersFormControl={filtersFormControl}
            selectedAirportId={selectedAirportId}
          />
          <div className="flex flex-wrap gap-x-6 gap-y-4">
            <TopAirlinesChart
              filtersFormControl={filtersFormControl}
              selectedAirportId={selectedAirportId}
            />
            <TopAirportsChart
              filtersFormControl={filtersFormControl}
              selectedAirportId={selectedAirportId}
            />
            <TopAircraftTypesChart
              filtersFormControl={filtersFormControl}
              selectedAirportId={selectedAirportId}
            />
            {isStatsFullScreen ? (
              <TopRoutesChart
                filtersFormControl={filtersFormControl}
                selectedAirportId={selectedAirportId}
              />
            ) : null}
            <TopCountriesChart
              filtersFormControl={filtersFormControl}
              selectedAirportId={selectedAirportId}
            />
            {isStatsFullScreen ? (
              <TopRegionsChart
                filtersFormControl={filtersFormControl}
                selectedAirportId={selectedAirportId}
              />
            ) : null}
            {isStatsFullScreen ? (
              <>
                <FlightTypePieChart
                  filtersFormControl={filtersFormControl}
                  selectedAirportId={selectedAirportId}
                />
                <FlightLengthRadarChart
                  filtersFormControl={filtersFormControl}
                  selectedAirportId={selectedAirportId}
                />
                <FlightClassRadarChart
                  filtersFormControl={filtersFormControl}
                  selectedAirportId={selectedAirportId}
                />
                <ReasonRadarChart
                  filtersFormControl={filtersFormControl}
                  selectedAirportId={selectedAirportId}
                />
                <SeatPositionRadarChart
                  filtersFormControl={filtersFormControl}
                  selectedAirportId={selectedAirportId}
                />
              </>
            ) : null}
          </div>
        </CardBody>
      </Card>
    </Form>
  );
};
