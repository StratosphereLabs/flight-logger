import { Card, CardBody } from 'stratosphere-ui';
import { TopAirlinesChart } from './TopAirlinesChart';
import { TopAircraftTypesChart } from './TopAircraftTypesChart';
import { TopAirportsChart } from './TopAirportsChart';
import { TopRoutesChart } from './TopRoutesChart';

export const Statistics = (): JSX.Element => (
  <div className="flex flex-1 flex-col">
    <article className="prose p-1">
      <h4 className="m-0">Statistics</h4>
    </article>
    <Card className="flex-1 bg-base-200 shadow-md" compact>
      <CardBody className="gap-4">
        <div className="flex flex-wrap gap-4">
          <TopAirlinesChart />
          <TopAircraftTypesChart />
          <TopAirportsChart />
          <TopRoutesChart />
        </div>
      </CardBody>
    </Card>
  </div>
);
