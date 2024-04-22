import { useWatch, type Control } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { Loading } from 'stratosphere-ui';
import { useTRPCErrorHandler } from '../../../../common/hooks';
import { trpc } from '../../../../utils/trpc';
import { type ProfileFilterFormData } from '../../Profile';

export interface AirportInfoOverlayProps {
  airportId: string | null;
  filtersFormControl: Control<ProfileFilterFormData>;
  showCompleted: boolean;
  showUpcoming: boolean;
}

export const AirportInfoOverlay = ({
  airportId,
  filtersFormControl,
  showCompleted,
  showUpcoming,
}: AirportInfoOverlayProps): JSX.Element | null => {
  const { username } = useParams();
  const onError = useTRPCErrorHandler();
  const [range, year, month, fromDate, toDate] = useWatch<
    ProfileFilterFormData,
    ['range', 'year', 'month', 'fromDate', 'toDate']
  >({
    control: filtersFormControl,
    name: ['range', 'year', 'month', 'fromDate', 'toDate'],
  });
  const { data, isFetching } = trpc.airports.getAirport.useQuery(
    {
      id: airportId ?? '',
      showCompleted,
      showUpcoming,
      username,
      range,
      year,
      month,
      fromDate,
      toDate,
    },
    {
      enabled: airportId !== null,
      onError,
    },
  );
  if (airportId === null) return null;
  return (
    <div className="pointer-events-auto flex flex-col items-center rounded-xl bg-base-100/50 p-2 backdrop-blur-sm">
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
