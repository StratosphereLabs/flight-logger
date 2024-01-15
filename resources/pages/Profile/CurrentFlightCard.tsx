import { useParams } from 'react-router-dom';
import { Card, CardBody } from 'stratosphere-ui';
import { PlaneSolidIcon } from '../../common/components';
import { trpc } from '../../utils/trpc';

export const CurrentFlightCard = (): JSX.Element | null => {
  const { username } = useParams();
  const { data } = trpc.users.getUserCurrentFlight.useQuery({
    username,
  });
  if (data === null || data === undefined) {
    return null;
  }
  return (
    <Card className="bg-base-200 shadow-md">
      <CardBody>
        <div className="flex w-full justify-between text-sm">
          <div className="flex gap-4 font-mono">
            <img
              alt={`${data.airline?.name} Logo`}
              className="max-h-[25px] max-w-[100px]"
              src={data.airline?.logo ?? ''}
            />
            {data.airline?.iata} {data.flightNumber}
          </div>
          <div className="flex font-semibold">{data.aircraftType?.name}</div>
        </div>
        <div className="flex w-full items-center justify-between gap-3 font-mono text-xl font-semibold">
          <div>{data.departureAirport.iata}</div>
          <div className="relative h-full flex-1">
            <div className="absolute left-0 top-0 flex h-full w-full items-center px-2 opacity-50">
              <progress
                className="progress progress-primary left-0 top-0 flex-1"
                value={100 * data.progress}
                max="100"
              />
            </div>
            <div className="absolute left-0 top-0 z-20 h-full w-full px-2">
              <div
                className="relative h-full overflow-visible"
                style={{
                  width: `${100 * data.progress}%`,
                }}
              >
                <PlaneSolidIcon
                  className="absolute right-0 h-10 w-10 text-success"
                  style={{
                    transform: 'translate(50%, -15%)',
                  }}
                />
              </div>
            </div>
            <div className="absolute left-0 top-0 z-10 flex h-full w-full items-center justify-between">
              <div className="h-4 w-4 rounded-full bg-neutral" />
              <div className="h-4 w-4 rounded-full bg-neutral" />
            </div>
          </div>
          <div>{data.arrivalAirport.iata}</div>
        </div>
        <div className="flex w-full justify-between font-mono text-sm opacity-75">
          <div className="flex flex-col">{data?.outTimeLocal}</div>
          <div>
            {data !== undefined && data.durationRemaining > 0
              ? `${data.durationRemainingString} remaining`
              : ''}
          </div>
          <div className="flex flex-col">{data?.inTimeLocal}</div>
        </div>
      </CardBody>
    </Card>
  );
};
