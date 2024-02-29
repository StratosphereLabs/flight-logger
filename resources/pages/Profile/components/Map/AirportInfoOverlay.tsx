import { useParams } from 'react-router-dom';
import { Loading } from 'stratosphere-ui';
import { useTRPCErrorHandler } from '../../../../common/hooks';
import { trpc } from '../../../../utils/trpc';

export interface AirportInfoOverlayProps {
  airportId: string | null;
  showCompleted: boolean;
  showUpcoming: boolean;
}

export const AirportInfoOverlay = ({
  airportId,
  showCompleted,
  showUpcoming,
}: AirportInfoOverlayProps): JSX.Element | null => {
  const { username } = useParams();
  const onError = useTRPCErrorHandler();
  const { data, isFetching } = trpc.airports.getAirport.useQuery(
    { id: airportId ?? '', showCompleted, showUpcoming, username },
    {
      enabled: airportId !== null,
      onError,
    },
  );
  if (airportId === null) return null;
  return (
    <div className="pointer-events-auto flex flex-col items-center rounded-xl bg-base-100/70 p-2">
      {isFetching ? <Loading /> : null}
      {!isFetching && data !== undefined ? (
        <>
          <p className="font-semibold">{data?.id}</p>
          <p className="text-center text-xs opacity-70">{data?.municipality}</p>
          <p className="text-center text-xs opacity-70">
            {data.numFlights} {data.numFlights === 1 ? 'flight' : 'flights'}
          </p>
        </>
      ) : null}
    </div>
  );
};
