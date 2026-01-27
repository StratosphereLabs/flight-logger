import { useNavigate } from '@tanstack/react-router';
import classNames from 'classnames';
import { type Dispatch, type SetStateAction } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Card, CardBody, CardTitle, Form } from 'stratosphere-ui';

import { CollapseIcon, ExpandIcon } from '../../../../common/components';
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
  isStatsFullScreen: boolean;
  selectedAirportId: string | null;
  setIsStatsFullScreen: Dispatch<SetStateAction<boolean>>;
}

export const StatisticsCard = ({
  isStatsFullScreen,
  selectedAirportId,
  setIsStatsFullScreen,
}: StatisticsProps): JSX.Element => {
  const navigate = useNavigate({ from: '/profile' });
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
    <Form methods={methods} className="flex w-full flex-1 flex-col">
      <Card className="bg-base-100 flex-1 shadow-xs">
        <CardBody className="p-4">
          <div className="flex items-start justify-between gap-2">
            <CardTitle>Statistics</CardTitle>
            <Button
              onClick={() => {
                void navigate({
                  search: prev => ({
                    ...prev,
                    isStatsFullScreen:
                      prev.isStatsFullScreen === true ? undefined : true,
                  }),
                  replace: true,
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
            isStatsFullScreen={isStatsFullScreen}
            selectedAirportId={selectedAirportId}
          />
          <div
            className={classNames(
              'grid grid-cols-1 gap-x-8 gap-y-4',
              isStatsFullScreen
                ? 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5'
                : 'sm:grid-cols-2 2xl:grid-cols-4',
            )}
          >
            <TopAirlinesChart selectedAirportId={selectedAirportId} />
            <TopAirportsChart selectedAirportId={selectedAirportId} />
            <TopAircraftTypesChart selectedAirportId={selectedAirportId} />
            {isStatsFullScreen ? (
              <TopRoutesChart selectedAirportId={selectedAirportId} />
            ) : null}
            <TopCountriesChart selectedAirportId={selectedAirportId} />
            {isStatsFullScreen ? (
              <TopRegionsChart selectedAirportId={selectedAirportId} />
            ) : null}
            {isStatsFullScreen ? (
              <>
                <FlightTypePieChart selectedAirportId={selectedAirportId} />
                <FlightLengthRadarChart selectedAirportId={selectedAirportId} />
                <FlightClassRadarChart selectedAirportId={selectedAirportId} />
                <ReasonRadarChart selectedAirportId={selectedAirportId} />
                <SeatPositionRadarChart selectedAirportId={selectedAirportId} />
              </>
            ) : null}
          </div>
        </CardBody>
      </Card>
    </Form>
  );
};
