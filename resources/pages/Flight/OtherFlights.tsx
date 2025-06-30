import { useMemo, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import {
  Button,
  Form,
  FormRadioGroup,
  FormRadioGroupOption,
  Loading,
} from 'stratosphere-ui';

import { type GetUserOtherFlightsRequest } from '../../../app/schemas';
import { trpc } from '../../utils/trpc';
import { FlightHistoryRow } from './FlightHistoryRow';

export interface OtherFlightsProps {
  flightId: string;
}

export type OtherFlightsFormData = Pick<
  GetUserOtherFlightsRequest,
  'user' | 'mode'
>;

export const OtherFlights = ({ flightId }: OtherFlightsProps): JSX.Element => {
  const headerRef = useRef<HTMLDivElement | null>(null);
  const methods = useForm<OtherFlightsFormData>({
    defaultValues: {
      user: 'mine',
      mode: 'route',
    },
  });
  const [user, mode] = useWatch<OtherFlightsFormData, ['user', 'mode']>({
    control: methods.control,
    name: ['user', 'mode'],
  });
  const { data, isLoading, isFetching, fetchNextPage } =
    trpc.flights.getOtherFlights.useInfiniteQuery(
      {
        flightId,
        user,
        mode,
        limit: 5,
      },
      {
        getNextPageParam: ({ metadata }) =>
          metadata.page < metadata.pageCount ? metadata.page + 1 : undefined,
      },
    );
  const flattenedData = useMemo(
    () => data?.pages.flatMap(({ results }) => results) ?? [],
    [data?.pages],
  );
  const remainingRows =
    data !== undefined
      ? data.pages[0].metadata.itemCount - flattenedData.length
      : 0;
  return (
    <div className="flex flex-col gap-2">
      <div className="font-semibold" ref={headerRef}>
        Flight History
      </div>
      <Form className="flex flex-col gap-2" methods={methods}>
        <FormRadioGroup activeColor="info" name="user">
          <FormRadioGroupOption className="flex-1" size="sm" soft value="mine">
            My Flights
          </FormRadioGroupOption>
          <FormRadioGroupOption
            className="flex-1"
            size="sm"
            soft
            value="following"
          >
            Following Flights
          </FormRadioGroupOption>
        </FormRadioGroup>
        <FormRadioGroup activeColor="info" name="mode">
          <FormRadioGroupOption className="flex-1" size="sm" soft value="route">
            Route
          </FormRadioGroupOption>
          <FormRadioGroupOption
            className="flex-1"
            size="sm"
            soft
            value="airline"
          >
            Airline
          </FormRadioGroupOption>
          <FormRadioGroupOption
            className="flex-1"
            size="sm"
            soft
            value="aircraftType"
          >
            Aircraft
          </FormRadioGroupOption>
          <FormRadioGroupOption
            className="flex-1"
            size="sm"
            soft
            value="airframe"
          >
            Airframe
          </FormRadioGroupOption>
        </FormRadioGroup>
      </Form>
      {flattenedData.length === 0 && !isLoading ? (
        <div className="my-4 text-center">No Flights Found</div>
      ) : null}
      {isLoading ? (
        <div className="flex justify-center">
          <Loading />
        </div>
      ) : null}
      <div className="flex w-full flex-1 flex-col gap-2">
        {flattenedData.map(flight => (
          <FlightHistoryRow key={flight.id} flight={flight} />
        ))}
      </div>
      <div className="flex justify-center">
        <Button
          className="w-[175px]"
          color="neutral"
          disabled={
            isFetching ||
            flattenedData.length === data?.pages[0].metadata.itemCount
          }
          loading={isFetching && !isLoading}
          onClick={async () => {
            await fetchNextPage();
          }}
          size="sm"
        >
          View More{' '}
          {remainingRows > 0 ? `(${remainingRows.toLocaleString()})` : ''}
        </Button>
      </div>
    </div>
  );
};
