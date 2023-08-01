import { useParams } from 'react-router-dom';
import { Loading } from 'stratosphere-ui';
import { useTRPCErrorHandler } from '../../common/hooks';
import { trpc } from '../../utils/trpc';

export interface AirportInfoOverlayProps {
  airportId: string | null;
}

export const AirportInfoOverlay = ({
  airportId,
}: AirportInfoOverlayProps): JSX.Element | null => {
  const { username } = useParams();
  const { data, error, isFetching } = trpc.airports.getAirport.useQuery(
    { id: airportId ?? '', username },
    {
      enabled: airportId !== null,
    },
  );
  useTRPCErrorHandler(error);
  if (airportId === null) return null;
  return (
    <div className="flex flex-col bg-base-100/70 rounded-xl p-2 items-center pointer-events-auto">
      {isFetching ? <Loading /> : null}
      {!isFetching && data !== undefined ? (
        <>
          <p className="font-semibold">{data?.id}</p>
          <p className="text-xs opacity-70 text-center">{data?.municipality}</p>
          <p className="text-xs opacity-70 text-center">
            {data.numFlights} {data.numFlights === 1 ? 'flight' : 'flights'}
          </p>
        </>
      ) : null}
    </div>
  );
};
