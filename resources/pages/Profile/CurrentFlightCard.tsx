import { useParams } from 'react-router-dom';
import { Card, CardBody } from 'stratosphere-ui';
import { PlaneSolidIcon } from '../../common/components';
import { trpc } from '../../utils/trpc';

export const CurrentFlightCard = (): JSX.Element | null => {
  const { username } = useParams();
  const { data } = trpc.users.getUserCurrentFlight.useQuery({
    username,
  });
  return data !== null && data !== undefined ? (
    <Card className="bg-base-200 shadow-md">
      <CardBody>
        <div className="flex w-full items-center justify-between gap-3 font-mono text-lg font-semibold">
          <h2>{data.departureAirport.iata}</h2>
          <div className="relative h-full flex-1">
            <div className="absolute left-0 top-0 flex h-full w-full items-center justify-end opacity-30">
              <div
                className="border-4 border-dashed border-neutral"
                style={{
                  width: `${100 * (1 - data.progress)}%`,
                }}
              ></div>
            </div>
            <div
              className="absolute left-0 top-0 z-20 flex h-full min-w-10 items-center justify-end"
              style={{
                width: `calc(${100 * data.progress}% - ${
                  40 * (1 - data.progress)
                }px)`,
              }}
            >
              <PlaneSolidIcon className="h-10 w-10 text-success" />
            </div>
            <div className="absolute left-0 top-0 flex h-full w-full items-center opacity-50">
              <div
                className="border-4 border-solid border-primary"
                style={{
                  width: `${100 * data.progress}%`,
                }}
              ></div>
            </div>
            <div className="absolute left-0 top-0 z-10 flex h-full w-full items-center justify-between">
              <div className="h-4 w-4 rounded-full bg-neutral"></div>
              <div className="h-4 w-4 rounded-full bg-neutral"></div>
            </div>
          </div>
          <h2>{data.arrivalAirport.iata}</h2>
        </div>
      </CardBody>
    </Card>
  ) : null;
};
