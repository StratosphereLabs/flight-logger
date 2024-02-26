import {
  Card,
  CardBody,
  Form,
  FormToggleSwitch,
  useFormWithQueryParams,
} from 'stratosphere-ui';
import { FlightClassRadarChart } from './FlightClassRadarChart';
import { FlightLengthRadarChart } from './FlightLengthRadarChart';
import { FlightTypePieChart } from './FlightTypePieChart';
import { ReasonRadarChart } from './ReasonRadarChart';
import { SeatPositionRadarChart } from './SeatPositionRadarChart';
import { TopAirlinesChart } from './TopAirlinesChart';
import { TopAircraftTypesChart } from './TopAircraftTypesChart';
import { TopAirportsChart } from './TopAirportsChart';
import { TopRoutesChart } from './TopRoutesChart';

export interface StatisticsFiltersData {
  statsShowUpcoming: boolean;
}

export const Statistics = (): JSX.Element => {
  const methods = useFormWithQueryParams<
    StatisticsFiltersData,
    ['statsShowUpcoming']
  >({
    getDefaultValues: ({ statsShowUpcoming }) => ({
      statsShowUpcoming: statsShowUpcoming === 'true',
    }),
    getSearchParams: ([statsShowUpcoming]) => ({
      statsShowUpcoming: statsShowUpcoming.toString(),
    }),
    includeKeys: ['statsShowUpcoming'],
  });
  return (
    <Form methods={methods} className="flex flex-1 flex-col">
      <article className="prose p-1">
        <h4 className="m-0">Statistics</h4>
      </article>
      <Card className="flex-1 bg-base-200 shadow-md" compact>
        <div className="flex justify-end rounded-t-box bg-base-300 p-2 shadow-sm">
          <FormToggleSwitch
            name="statsShowUpcoming"
            labelText="Show Upcoming"
            size="sm"
          />
        </div>
        <CardBody className="gap-4">
          <div className="flex flex-wrap gap-x-6 gap-y-4">
            <TopAirlinesChart filtersFormControl={methods.control} />
            <TopAircraftTypesChart filtersFormControl={methods.control} />
            <TopAirportsChart filtersFormControl={methods.control} />
            <TopRoutesChart filtersFormControl={methods.control} />
            <FlightTypePieChart filtersFormControl={methods.control} />
            <FlightLengthRadarChart filtersFormControl={methods.control} />
            <ReasonRadarChart filtersFormControl={methods.control} />
            <FlightClassRadarChart filtersFormControl={methods.control} />
            <SeatPositionRadarChart filtersFormControl={methods.control} />
          </div>
        </CardBody>
      </Card>
    </Form>
  );
};
